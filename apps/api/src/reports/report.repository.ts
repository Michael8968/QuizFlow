import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from '../database/base.repository';
import { SupabaseService } from '../database/supabase.service';
import type { Report } from '@quizflow/types';

export interface FindReportsOptions {
  userId: string;
  paperId?: string;
  page?: number;
  limit?: number;
}

export interface ReportWithPaper extends Report {
  paper?: {
    title: string;
  };
}

/**
 * 报告 Repository
 * 处理报告相关的数据访问
 */
@Injectable()
export class ReportRepository extends BaseRepository<Report> {
  constructor(private readonly supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'reports');
  }

  /**
   * 根据用户 ID 查询报告（带试卷标题）
   */
  async findByUserIdWithPaper(options: FindReportsOptions): Promise<PaginatedResult<ReportWithPaper>> {
    let query = this.supabase
      .from(this.tableName)
      .select(
        `
        *,
        paper:papers(title)
      `,
        { count: 'exact' },
      )
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false });

    // 试卷过滤
    if (options.paperId) {
      query = query.eq('paper_id', options.paperId);
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
   * 根据用户 ID 查询报告
   */
  async findByUserId(options: FindReportsOptions): Promise<PaginatedResult<Report>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false });

    // 试卷过滤
    if (options.paperId) {
      query = query.eq('paper_id', options.paperId);
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
   * 根据试卷 ID 查找报告
   */
  async findByPaperId(paperId: string): Promise<Report | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('paper_id', paperId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw error;
    }
    return data;
  }

  /**
   * 统计用户的报告数量
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
   * 检查报告是否属于指定用户
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
}
