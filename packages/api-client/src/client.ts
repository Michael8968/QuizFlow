import type { ApiError } from '@quizflow/types';

/**
 * 客户端 API 响应
 */
export interface ClientApiResponse<T = unknown> {
  data: T;
  status: number;
}

/**
 * 查询参数类型
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * 请求配置
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: QueryParams | object;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * 拦截器上下文
 */
export interface InterceptorContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  config?: RequestConfig;
}

/**
 * 响应拦截器上下文
 */
export interface ResponseContext<T = unknown> {
  response: Response;
  data: T;
  request: InterceptorContext;
}

/**
 * 错误拦截器上下文
 */
export interface ErrorContext {
  error: Error | ApiError;
  request: InterceptorContext;
  response?: Response;
}

/**
 * 请求拦截器
 */
export type RequestInterceptor = (
  context: InterceptorContext
) => InterceptorContext | Promise<InterceptorContext>;

/**
 * 响应拦截器
 */
export type ResponseInterceptor = <T>(
  context: ResponseContext<T>
) => ResponseContext<T> | Promise<ResponseContext<T>>;

/**
 * 错误拦截器
 */
export type ErrorInterceptor = (
  context: ErrorContext
) => ErrorContext | Promise<ErrorContext> | never;

/**
 * API Client 配置
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  getToken?: () => string | null | Promise<string | null>;
  refreshToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
}

/**
 * API Client 核心类
 */
export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private getToken?: () => string | null | Promise<string | null>;
  private refreshToken?: () => Promise<string | null>;
  private onUnauthorized?: () => void;

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.defaultTimeout = config.timeout ?? 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.getToken = config.getToken;
    this.refreshToken = config.refreshToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 构建完整 URL
   */
  private buildUrl(path: string, params?: QueryParams | object): string {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * 执行请求
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ClientApiResponse<T>> {
    // 构建请求上下文
    let context: InterceptorContext = {
      url: this.buildUrl(path, config?.params),
      method,
      headers: { ...this.defaultHeaders, ...config?.headers },
      body,
      config,
    };

    // 添加认证 token
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        context.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // 执行请求拦截器
    for (const interceptor of this.requestInterceptors) {
      context = await interceptor(context);
    }

    // 创建 AbortController 用于超时
    const controller = new AbortController();
    const timeout = config?.timeout ?? this.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(context.url, {
        method: context.method,
        headers: context.headers,
        body: context.body ? JSON.stringify(context.body) : undefined,
        signal: config?.signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理 401 未授权
      if (response.status === 401) {
        // 尝试刷新 token
        if (this.refreshToken) {
          const newToken = await this.refreshToken();
          if (newToken) {
            // 使用新 token 重试请求
            context.headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(context.url, {
              method: context.method,
              headers: context.headers,
              body: context.body ? JSON.stringify(context.body) : undefined,
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return this.processResponse<T>(data, retryResponse, context);
            }
          }
        }

        // Token 刷新失败或没有刷新函数
        this.onUnauthorized?.();
        throw this.createApiError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      // 解析响应
      const data = await response.json();

      if (!response.ok) {
        throw this.createApiError(
          data.message || 'Request failed',
          response.status,
          data.code || 'REQUEST_FAILED',
          data.details
        );
      }

      return this.processResponse<T>(data, response, context);
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError('Request timeout', 408, 'TIMEOUT');
      }

      // 执行错误拦截器
      let errorContext: ErrorContext = {
        error: error as Error | ApiError,
        request: context,
      };

      for (const interceptor of this.errorInterceptors) {
        errorContext = await interceptor(errorContext);
      }

      throw errorContext.error;
    }
  }

  /**
   * 处理响应
   */
  private async processResponse<T>(
    data: T,
    response: Response,
    request: InterceptorContext
  ): Promise<ClientApiResponse<T>> {
    let responseContext: ResponseContext<T> = {
      response,
      data,
      request,
    };

    // 执行响应拦截器
    for (const interceptor of this.responseInterceptors) {
      responseContext = await interceptor(responseContext);
    }

    return {
      data: responseContext.data,
      status: response.status,
    };
  }

  /**
   * 创建 API 错误
   */
  private createApiError(
    message: string,
    status: number,
    code: string,
    details?: Record<string, unknown>
  ): ApiError {
    return {
      message,
      status,
      code,
      details,
    };
  }

  /**
   * GET 请求
   */
  async get<T>(path: string, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.request<T>('GET', path, undefined, config);
  }

  /**
   * POST 请求
   */
  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.request<T>('POST', path, body, config);
  }

  /**
   * PUT 请求
   */
  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.request<T>('PUT', path, body, config);
  }

  /**
   * PATCH 请求
   */
  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.request<T>('PATCH', path, body, config);
  }

  /**
   * DELETE 请求
   */
  async delete<T>(path: string, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

/**
 * 创建 API Client 实例
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
