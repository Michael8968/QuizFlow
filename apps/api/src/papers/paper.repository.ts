import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from '../database/base.repository';
import { SupabaseService } from '../database/supabase.service';
import type { Paper, PaperStatus } from '@quizflow/types';

export interface FindPapersOptions {
  userId: string;
  status?: PaperStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * 试卷 Repository
 * 处理试卷相关的数据访问
 */
@Injectable()
export class PaperRepository extends BaseRepository<Paper> {
  constructor(private readonly supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'papers');
  }

  /**
   * 根据用户 ID 查询试卷（分页）
   */
  async findByUserId(options: FindPapersOptions): Promise<PaginatedResult<Paper>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false });

    // 状态过滤
    if (options.status) {
      query = query.eq('status', options.status);
    }

    // 标题搜索
    if (options.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    // 分页
    if (options.page && options.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * 根据考试码查找已发布的试卷
   */
  async findByQuizCode(quizCode: string): Promise<Paper | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('quiz_code', quizCode)
      .eq('status', 'published')
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw error;
    }
    return data;
  }

  /**
   * 检查试卷是否属于指定用户
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
   * 生成唯一的考试码
   */
  async generateUniqueQuizCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // 检查代码是否已存在
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('quiz_code', code)
        .single();

      if (error && this.isNotFoundError(error)) {
        return code;
      }

      attempts++;
    }

    // 如果多次尝试都失败，使用时间戳后缀
    const baseCode = chars.slice(0, 4);
    return `${baseCode}${Date.now().toString().slice(-2)}`;
  }

  /**
   * 更新试卷状态
   */
  async updateStatus(id: string, status: PaperStatus): Promise<Paper> {
    const updateData: Partial<Paper> = { status };

    // 如果状态变为 published，需要生成考试码
    if (status === 'published') {
      const paper = await this.findById(id);
      if (paper && !paper.quiz_code) {
        updateData.quiz_code = await this.generateUniqueQuizCode();
      }
    }

    return this.update(id, updateData);
  }

  /**
   * 统计用户的试卷数量
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
   * 统计用户已发布的试卷数量
   */
  async countPublishedByUserId(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published');

    if (error) throw error;
    return count || 0;
  }
}
