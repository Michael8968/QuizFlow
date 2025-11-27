import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from '../database/base.repository';
import { SupabaseService } from '../database/supabase.service';
import type { Question } from '@quizflow/types';

export interface FindQuestionsOptions {
  userId: string;
  search?: string;
  tags?: string[];
  difficulty?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * 题目 Repository
 * 处理题目相关的数据访问
 */
@Injectable()
export class QuestionRepository extends BaseRepository<Question> {
  constructor(private readonly supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'questions');
  }

  /**
   * 根据用户 ID 查询题目（分页）
   */
  async findByUserId(options: FindQuestionsOptions): Promise<PaginatedResult<Question>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false });

    // 内容搜索
    if (options.search) {
      query = query.or(
        `content.ilike.%${options.search}%,tags.cs.{${options.search}}`,
      );
    }

    // 标签过滤
    if (options.tags?.length) {
      query = query.contains('tags', options.tags);
    }

    // 难度过滤
    if (options.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }

    // 类型过滤
    if (options.type) {
      query = query.eq('type', options.type);
    }

    // 分页
    const page = options.page || 1;
    const limit = options.limit || 20;
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
   * 根据多个 ID 批量查询题目
   */
  async findByIds(ids: string[]): Promise<Question[]> {
    if (ids.length === 0) return [];

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  }

  /**
   * 检查题目是否属于指定用户
   */
  async belongsToUser(id: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && this.isNotFoundError(error)) return false;
    if (error) throw error;
    return !!data;
  }

  /**
   * 统计用户的题目数量
   */
  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  }

  /**
   * 获取用户所有标签
   */
  async getTagsByUserId(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('tags')
      .eq('user_id', userId);

    if (error) throw error;

    // 合并并去重所有标签
    const allTags = (data || []).flatMap((q) => q.tags || []);
    return [...new Set(allTags)];
  }
}
