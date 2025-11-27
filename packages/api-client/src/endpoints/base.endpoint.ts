import type { ApiClient, RequestConfig, ClientApiResponse } from '../client';

/**
 * 基础 Endpoint 类
 * 所有具体 endpoint 都继承此类
 */
export abstract class BaseEndpoint {
  protected client: ApiClient;
  protected basePath: string;

  constructor(client: ApiClient, basePath: string) {
    this.client = client;
    this.basePath = basePath;
  }

  /**
   * 构建完整路径
   */
  protected buildPath(subPath?: string): string {
    if (!subPath) {
      return this.basePath;
    }
    return `${this.basePath}${subPath.startsWith('/') ? subPath : `/${subPath}`}`;
  }

  /**
   * GET 请求
   */
  protected doGet<T>(path: string, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.client.get<T>(this.buildPath(path), config);
  }

  /**
   * POST 请求
   */
  protected doPost<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.client.post<T>(this.buildPath(path), body, config);
  }

  /**
   * PUT 请求
   */
  protected doPut<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.client.put<T>(this.buildPath(path), body, config);
  }

  /**
   * PATCH 请求
   */
  protected doPatch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.client.patch<T>(this.buildPath(path), body, config);
  }

  /**
   * DELETE 请求
   */
  protected doDelete<T>(path: string, config?: RequestConfig): Promise<ClientApiResponse<T>> {
    return this.client.delete<T>(this.buildPath(path), config);
  }
}
