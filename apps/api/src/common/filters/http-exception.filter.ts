import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import type { ApiError } from '@quizflow/types';

/**
 * API 错误响应格式
 */
interface ErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
  path: string;
}

/**
 * 全局异常过滤器
 * 统一处理所有未捕获的异常，返回标准化的错误响应
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiError;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorResponse = {
          code: this.getErrorCode(status),
          message: exceptionResponse,
          status,
        };
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;

        // 处理 class-validator 的验证错误
        if (Array.isArray(resp.message)) {
          errorResponse = {
            code: 'VALIDATION_ERROR',
            message: '输入数据验证失败',
            status,
            details: { errors: resp.message },
          };
        } else {
          errorResponse = {
            code: (resp.code as string) || this.getErrorCode(status),
            message: (resp.message as string) || exception.message,
            status,
            details: resp.details as Record<string, unknown>,
          };
        }
      } else {
        errorResponse = {
          code: this.getErrorCode(status),
          message: exception.message,
          status,
        };
      }
    } else if (exception instanceof Error) {
      // 处理数据库错误
      errorResponse = this.handleDatabaseError(exception);
      status = errorResponse.status;

      // 记录详细错误日志（仅在非预期错误时）
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url} - ${exception.message}`,
          exception.stack,
        );
      }
    } else {
      errorResponse = {
        code: 'UNKNOWN_ERROR',
        message: '未知错误',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
      this.logger.error('Unknown error', exception);
    }

    const errorBody: ErrorResponse = {
      success: false,
      error: errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorBody);
  }

  /**
   * 根据 HTTP 状态码获取错误代码
   */
  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };

    return codeMap[status] || `HTTP_${status}`;
  }

  /**
   * 处理数据库相关错误
   */
  private handleDatabaseError(error: Error): ApiError {
    const message = error.message || '';

    // 重复键错误
    if (message.includes('duplicate key') || message.includes('already exists')) {
      return {
        code: 'DUPLICATE_ENTRY',
        message: '记录已存在',
        status: HttpStatus.CONFLICT,
      };
    }

    // 外键约束错误
    if (message.includes('foreign key') || message.includes('violates foreign key')) {
      return {
        code: 'FOREIGN_KEY_VIOLATION',
        message: '关联数据不存在',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    // 非空约束错误
    if (message.includes('not-null') || message.includes('null value')) {
      return {
        code: 'NULL_VIOLATION',
        message: '必填字段不能为空',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    // Supabase 特定错误
    if (message.includes('PGRST')) {
      return {
        code: 'DATABASE_ERROR',
        message: '数据库操作失败',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    // 默认内部错误
    return {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}
