import { BaseEndpoint } from './base.endpoint';
import type { ApiClient, ClientApiResponse } from '../client';
import type { User } from '@quizflow/types';

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

/**
 * 刷新 Token 响应
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * 认证相关 API
 */
export class AuthEndpoint extends BaseEndpoint {
  constructor(client: ApiClient) {
    super(client, '/auth');
  }

  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<ClientApiResponse<AuthResponse>> {
    return this.doPost<AuthResponse>('/login', data);
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<ClientApiResponse<AuthResponse>> {
    return this.doPost<AuthResponse>('/register', data);
  }

  /**
   * 获取当前用户信息
   */
  async me(): Promise<ClientApiResponse<User>> {
    return this.doGet<User>('/me');
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<ClientApiResponse<RefreshTokenResponse>> {
    return this.doPost<RefreshTokenResponse>('/refresh', { refresh_token: refreshToken });
  }

  /**
   * 登出
   */
  async logout(): Promise<ClientApiResponse<void>> {
    return this.doPost<void>('/logout');
  }

  /**
   * 发送密码重置邮件
   */
  async forgotPassword(email: string): Promise<ClientApiResponse<void>> {
    return this.doPost<void>('/forgot-password', { email });
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, password: string): Promise<ClientApiResponse<void>> {
    return this.doPost<void>('/reset-password', { token, password });
  }

  /**
   * 修改密码
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ClientApiResponse<void>> {
    return this.doPost<void>('/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }
}
