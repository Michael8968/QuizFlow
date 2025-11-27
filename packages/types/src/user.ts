/**
 * 用户角色
 */
export type UserRole = 'teacher' | 'student' | 'admin';

/**
 * 订阅套餐类型
 */
export type PlanType = 'free' | 'professional' | 'institution' | 'ai_enhanced';

/**
 * 用户基础信息
 */
export interface UserBase {
  email: string;
  name: string;
  role: UserRole;
  plan: PlanType;
}

/**
 * 完整用户信息（包含数据库字段）
 */
export interface User extends UserBase {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户登录响应
 */
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

/**
 * 登录请求
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * 注册请求
 */
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}
