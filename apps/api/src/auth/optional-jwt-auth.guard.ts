import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 可选的 JWT 认证守卫
 * 如果提供了有效的 JWT，则解析用户信息
 * 如果没有提供或无效，则继续执行但不设置用户
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 尝试验证 JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // 如果没有用户或有错误，返回 undefined 而不是抛出异常
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
