import type { ErrorInterceptor, ErrorContext } from '../client';
import type { ApiError } from '@quizflow/types';

/**
 * 错误拦截器配置
 */
export interface ErrorInterceptorConfig {
  onError?: (error: ApiError) => void;
  shouldRetry?: (error: ApiError) => boolean;
  transformError?: (error: ApiError) => ApiError;
}

/**
 * 判断是否为 API 错误
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error &&
    'code' in error
  );
}

/**
 * 创建错误拦截器
 * 统一处理和转换错误
 */
export function createErrorInterceptor(config?: ErrorInterceptorConfig): ErrorInterceptor {
  const { onError, transformError } = config ?? {};

  return (context: ErrorContext): ErrorContext => {
    let error = context.error;

    // 转换为标准 API 错误格式
    if (!isApiError(error)) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        code: 'UNKNOWN_ERROR',
      };
      error = apiError;
    }

    // 应用错误转换
    if (transformError && isApiError(error)) {
      error = transformError(error);
    }

    // 调用错误处理回调
    if (onError && isApiError(error)) {
      onError(error);
    }

    return {
      ...context,
      error,
    };
  };
}

/**
 * 常见错误消息映射
 */
export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '请先登录',
  FORBIDDEN: '没有权限访问',
  NOT_FOUND: '资源不存在',
  TIMEOUT: '请求超时，请重试',
  NETWORK_ERROR: '网络错误，请检查网络连接',
  VALIDATION_ERROR: '输入数据验证失败',
  SERVER_ERROR: '服务器错误，请稍后重试',
};

/**
 * 获取友好的错误消息
 */
export function getErrorMessage(error: ApiError): string {
  return ERROR_MESSAGES[error.code] || error.message;
}
