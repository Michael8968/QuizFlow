import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from '../database/base.repository';
import { SupabaseService } from '../database/supabase.service';
import type { Feedback, FeedbackStatus } from '@quizflow/types';

export interface FindFeedbacksOptions {
  userId?: string;
  status?: FeedbackStatus;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * 反馈 Repository
 * 处理反馈相关的数据访问
 */
@Injectable()
export class FeedbackRepository extends BaseRepository<Feedback> {
  constructor(private readonly supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'feedbacks');
  }

  /**
   * 查询反馈列表（分页）
   */
  async findAll(options?: FindFeedbacksOptions): Promise<PaginatedResult<Feedback>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 用户过滤
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    // 状态过滤
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    // 类型过滤
    if (options?.type) {
      query = query.eq('type', options.type);
    }

    // 分页
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * 根据用户 ID 查询反馈列表
   */
  async findByUserId(userId: string, options?: Omit<FindFeedbacksOptions, 'userId'>): Promise<PaginatedResult<Feedback>> {
    return this.findAll({ ...options, userId });
  }

  /**
   * 统计反馈数量
   */
  async countByStatus(status?: FeedbackStatus): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  /**
   * 获取反馈统计
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    resolved: number;
    avgRating: number;
  }> {
    const [total, pending, reviewed, resolved] = await Promise.all([
      this.countByStatus(),
      this.countByStatus('pending'),
      this.countByStatus('reviewed'),
      this.countByStatus('resolved'),
    ]);

    // 获取平均评分
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('rating')
      .not('rating', 'is', null);

    if (error) throw error;

    const ratings = data?.filter(d => d.rating) || [];
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, d) => sum + (d.rating || 0), 0) / ratings.length
      : 0;

    return {
      total,
      pending,
      reviewed,
      resolved,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }
}
