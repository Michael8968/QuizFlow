import type { RequestInterceptor, InterceptorContext } from '../client';

/**
 * 认证拦截器配置
 */
export interface AuthInterceptorConfig {
  tokenKey?: string;
  headerName?: string;
  tokenPrefix?: string;
}

/**
 * 创建认证拦截器
 * 自动从 localStorage 获取 token 并添加到请求头
 */
export function createAuthInterceptor(config?: AuthInterceptorConfig): RequestInterceptor {
  const {
    tokenKey = 'access_token',
    headerName = 'Authorization',
    tokenPrefix = 'Bearer',
  } = config ?? {};

  return (context: InterceptorContext): InterceptorContext => {
    // 如果已经有 Authorization header，跳过
    if (context.headers[headerName]) {
      return context;
    }

    // 尝试从 localStorage 获取 token
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        context.headers[headerName] = `${tokenPrefix} ${token}`;
      }
    }

    return context;
  };
}
