import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常基类
 * 用于表示业务逻辑相关的错误
 */
export class BusinessException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, unknown>,
  ) {
    super({ code, message, details }, status);
  }
}

/**
 * 配额超限异常
 * 当用户使用的资源超出套餐限制时抛出
 */
export class QuotaExceededException extends BusinessException {
  constructor(resource: string) {
    super(
      'QUOTA_EXCEEDED',
      `${resource}配额已用完，请升级套餐`,
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

/**
 * 资源不存在异常
 * 当请求的资源不存在时抛出
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource}不存在: ${id}` : `${resource}不存在`;
    super('NOT_FOUND', message, HttpStatus.NOT_FOUND);
  }
}

/**
 * 权限拒绝异常
 * 当用户无权执行某操作时抛出
 */
export class PermissionDeniedException extends BusinessException {
  constructor(action?: string) {
    const message = action ? `无权执行操作: ${action}` : '无权执行此操作';
    super('PERMISSION_DENIED', message, HttpStatus.FORBIDDEN);
  }
}

/**
 * 验证异常
 * 当数据验证失败时抛出
 */
export class ValidationException extends BusinessException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 冲突异常
 * 当资源状态冲突时抛出（如重复创建）
 */
export class ConflictException extends BusinessException {
  constructor(message: string) {
    super('CONFLICT', message, HttpStatus.CONFLICT);
  }
}

/**
 * 认证异常
 * 当用户未登录或 token 无效时抛出
 */
export class UnauthorizedException extends BusinessException {
  constructor(message = '请先登录') {
    super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * 操作过于频繁异常
 * 当用户请求频率过高时抛出
 */
export class TooManyRequestsException extends BusinessException {
  constructor(message = '操作过于频繁，请稍后重试') {
    super('TOO_MANY_REQUESTS', message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * 服务不可用异常
 * 当外部服务不可用时抛出
 */
export class ServiceUnavailableException extends BusinessException {
  constructor(service: string) {
    super(
      'SERVICE_UNAVAILABLE',
      `${service}服务暂时不可用，请稍后重试`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * 试卷状态异常
 * 当试卷状态不允许某操作时抛出
 */
export class PaperStatusException extends BusinessException {
  constructor(action: string, currentStatus: string) {
    super(
      'INVALID_PAPER_STATUS',
      `试卷当前状态为 ${currentStatus}，无法${action}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * 答卷已提交异常
 * 当答卷已提交时尝试再次提交
 */
export class AnswerAlreadySubmittedException extends BusinessException {
  constructor() {
    super(
      'ANSWER_ALREADY_SUBMITTED',
      '答卷已提交，不能重复提交',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * 考试码无效异常
 */
export class InvalidQuizCodeException extends BusinessException {
  constructor() {
    super(
      'INVALID_QUIZ_CODE',
      '考试码无效或试卷未发布',
      HttpStatus.NOT_FOUND,
    );
  }
}
