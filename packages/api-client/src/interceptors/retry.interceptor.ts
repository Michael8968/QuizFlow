import type { ErrorInterceptor, ErrorContext } from '../client';
import type { ApiError } from '@quizflow/types';

/**
 * 重试拦截器配置
 */
export interface RetryInterceptorConfig {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: ApiError, attempt: number) => boolean;
  onRetry?: (error: ApiError, attempt: number) => void;
}

/**
 * 默认可重试的状态码
 */
const DEFAULT_RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

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
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建重试拦截器
 * 注意：这个拦截器只记录重试信息，实际重试逻辑需要在 ApiClient 中实现
 */
export function createRetryInterceptor(config?: RetryInterceptorConfig): ErrorInterceptor {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = (error: ApiError) =>
      DEFAULT_RETRYABLE_STATUS_CODES.includes(error.status),
    onRetry,
  } = config ?? {};

  // 使用 WeakMap 存储重试次数
  const retryCountMap = new Map<string, number>();

  return async (context: ErrorContext): Promise<ErrorContext> => {
    const error = context.error;

    if (!isApiError(error)) {
      return context;
    }

    // 生成请求标识
    const requestKey = `${context.request.method}:${context.request.url}`;
    const currentRetry = retryCountMap.get(requestKey) ?? 0;

    // 检查是否应该重试
    if (currentRetry < maxRetries && shouldRetry(error, currentRetry)) {
      const nextRetry = currentRetry + 1;
      retryCountMap.set(requestKey, nextRetry);

      // 调用重试回调
      onRetry?.(error, nextRetry);

      // 等待重试延迟（指数退避）
      const actualDelay = retryDelay * Math.pow(2, currentRetry);
      await delay(actualDelay);

      // 标记错误为可重试
      const retryableError: ApiError = {
        ...error,
        details: {
          ...(typeof error.details === 'object' ? error.details : {}),
          retryable: true,
          retryAttempt: nextRetry,
          maxRetries,
        },
      };

      return {
        ...context,
        error: retryableError,
      };
    }

    // 清除重试计数
    retryCountMap.delete(requestKey);

    return context;
  };
}
