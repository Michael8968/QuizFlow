import { BaseEndpoint } from './base.endpoint';
import type { ApiClient, ClientApiResponse } from '../client';
import type { Answer, AnswerStatus, PaginatedResponse } from '@quizflow/types';

/**
 * 提交答卷请求参数
 */
export interface SubmitAnswerRequest {
  quiz_code: string;
  student_name?: string;
  student_email?: string;
  responses: Record<string, string | string[]>;
  time_spent: number;
}

/**
 * 更新分数请求参数
 */
export interface UpdateScoreRequest {
  score: number;
  total_score: number;
}

/**
 * 查询答卷参数
 */
export interface QueryAnswersParams {
  page?: number;
  limit?: number;
  student_email?: string;
  status?: AnswerStatus;
}

/**
 * 答卷统计
 */
export interface AnswerStats {
  totalAnswers: number;
  completedCount: number;
  averageScore: number | null;
  averageTimeSpent: number | null;
}

/**
 * 答卷相关 API
 */
export class AnswersEndpoint extends BaseEndpoint {
  constructor(client: ApiClient) {
    super(client, '/answers');
  }

  /**
   * 提交答卷（公开接口）
   */
  async submit(data: SubmitAnswerRequest): Promise<ClientApiResponse<Answer>> {
    return this.doPost<Answer>('/submit', data);
  }

  /**
   * 获取试卷的答卷列表
   */
  async listByPaper(
    paperId: string,
    params?: QueryAnswersParams
  ): Promise<ClientApiResponse<PaginatedResponse<Answer>>> {
    return this.doGet<PaginatedResponse<Answer>>(`/paper/${paperId}`, { params });
  }

  /**
   * 获取试卷的答卷统计
   */
  async getStats(paperId: string): Promise<ClientApiResponse<AnswerStats>> {
    return this.doGet<AnswerStats>(`/paper/${paperId}/stats`);
  }

  /**
   * 获取单个答卷
   */
  async getById(id: string): Promise<ClientApiResponse<Answer>> {
    return this.doGet<Answer>(`/${id}`);
  }

  /**
   * 更新答卷分数
   */
  async updateScore(id: string, data: UpdateScoreRequest): Promise<ClientApiResponse<Answer>> {
    return this.doPatch<Answer>(`/${id}/score`, data);
  }
}
