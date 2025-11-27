import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from '../database/base.repository';
import { SupabaseService } from '../database/supabase.service';
import type { Answer, AnswerStatus } from '@quizflow/types';

export interface FindAnswersOptions {
  paperId?: string;
  studentEmail?: string;
  status?: AnswerStatus;
  page?: number;
  limit?: number;
}

export interface AnswerStats {
  totalAnswers: number;
  completedCount: number;
  averageScore: number;
  averageTimeSpent: number;
}

/**
 * 答卷 Repository
 * 处理答卷相关的数据访问
 */
@Injectable()
export class AnswerRepository extends BaseRepository<Answer> {
  constructor(private readonly supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'answers');
  }

  /**
   * 根据试卷 ID 查询答卷（分页）
   */
  async findByPaperId(paperId: string, options?: Omit<FindAnswersOptions, 'paperId'>): Promise<PaginatedResult<Answer>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('paper_id', paperId)
      .order('created_at', { ascending: false });

    // 状态过滤
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    // 学生邮箱过滤
    if (options?.studentEmail) {
      query = query.eq('student_email', options.studentEmail);
    }

    // 分页
    if (options?.page && options?.limit) {
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
   * 获取试卷的所有答卷（不分页）
   */
  async findAllByPaperId(paperId: string): Promise<Answer[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('paper_id', paperId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * 根据学生邮箱和试卷 ID 查找答卷
   */
  async findByStudentAndPaper(studentEmail: string, paperId: string): Promise<Answer | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('student_email', studentEmail)
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
   * 统计试卷的答卷数量
   */
  async countByPaperId(paperId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('paper_id', paperId);

    if (error) throw error;
    return count || 0;
  }

  /**
   * 获取试卷的答卷统计
   */
  async getStatsByPaperId(paperId: string): Promise<AnswerStats> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('score, total_score, time_spent, status')
      .eq('paper_id', paperId);

    if (error) throw error;

    const answers = data || [];
    const completedAnswers = answers.filter((a) => a.status === 'completed');

    const totalAnswers = answers.length;
    const completedCount = completedAnswers.length;

    const averageScore =
      completedCount > 0
        ? completedAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / completedCount
        : 0;

    const averageTimeSpent =
      completedCount > 0
        ? completedAnswers.reduce((sum, a) => sum + (a.time_spent || 0), 0) / completedCount
        : 0;

    return {
      totalAnswers,
      completedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent),
    };
  }

  /**
   * 更新答卷分数
   */
  async updateScore(id: string, score: number, totalScore: number): Promise<Answer> {
    return this.update(id, {
      score,
      total_score: totalScore,
      status: 'completed',
    } as Partial<Answer>);
  }

  /**
   * 检查学生是否已经提交过答卷
   */
  async hasSubmitted(studentEmail: string, paperId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('student_email', studentEmail)
      .eq('paper_id', paperId)
      .eq('status', 'completed')
      .single();

    if (error && this.isNotFoundError(error)) return false;
    if (error) throw error;
    return !!data;
  }
}
