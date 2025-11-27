import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../database/base.repository';
import { SupabaseService } from '../database/supabase.service';
import type { User } from '@quizflow/types';

/**
 * 用户 Repository
 * 处理用户相关的数据访问
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private readonly supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'users');
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw error;
    }
    return data;
  }

  /**
   * 检查邮箱是否已存在
   */
  async emailExists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('email', email)
      .single();

    if (error && this.isNotFoundError(error)) return false;
    if (error) throw error;
    return !!data;
  }

  /**
   * 更新用户套餐
   */
  async updatePlan(userId: string, plan: string): Promise<User> {
    return this.update(userId, { plan } as Partial<User>);
  }

  /**
   * 更新用户角色
   */
  async updateRole(userId: string, role: string): Promise<User> {
    return this.update(userId, { role } as Partial<User>);
  }

  /**
   * 创建用户（带完整信息）
   */
  async createUser(userData: {
    id: string;
    email: string;
    name: string;
    role?: string;
    plan?: string;
  }): Promise<User> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...userData,
        role: userData.role || 'teacher',
        plan: userData.plan || 'free',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
