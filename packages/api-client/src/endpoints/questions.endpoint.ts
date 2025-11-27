import { BaseEndpoint } from './base.endpoint';
import type { ApiClient, ClientApiResponse } from '../client';
import type { Question, QuestionType, PaginatedResponse } from '@quizflow/types';

/**
 * 创建题目请求参数
 */
export interface CreateQuestionRequest {
  type: QuestionType;
  content: string;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  points?: number;
  tags?: string[];
}

/**
 * 更新题目请求参数
 */
export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}

/**
 * 查询题目参数
 */
export interface QueryQuestionsParams {
  page?: number;
  limit?: number;
  type?: QuestionType;
  tag?: string;
  search?: string;
}

/**
 * 题目相关 API
 */
export class QuestionsEndpoint extends BaseEndpoint {
  constructor(client: ApiClient) {
    super(client, '/questions');
  }

  /**
   * 获取题目列表
   */
  async list(params?: QueryQuestionsParams): Promise<ClientApiResponse<PaginatedResponse<Question>>> {
    return this.doGet<PaginatedResponse<Question>>('', { params });
  }

  /**
   * 获取单个题目
   */
  async getById(id: string): Promise<ClientApiResponse<Question>> {
    return this.doGet<Question>(`/${id}`);
  }

  /**
   * 创建题目
   */
  async create(data: CreateQuestionRequest): Promise<ClientApiResponse<Question>> {
    return this.doPost<Question>('', data);
  }

  /**
   * 更新题目
   */
  async update(id: string, data: UpdateQuestionRequest): Promise<ClientApiResponse<Question>> {
    return this.doPatch<Question>(`/${id}`, data);
  }

  /**
   * 删除题目
   */
  async remove(id: string): Promise<ClientApiResponse<void>> {
    return this.doDelete<void>(`/${id}`);
  }

  /**
   * 批量删除题目
   */
  async batchDelete(ids: string[]): Promise<ClientApiResponse<void>> {
    return this.doPost<void>('/batch-delete', { ids });
  }

  /**
   * 获取用户的所有标签
   */
  async getTags(): Promise<ClientApiResponse<string[]>> {
    return this.doGet<string[]>('/tags');
  }

  /**
   * 统计题目数量
   */
  async count(): Promise<ClientApiResponse<number>> {
    return this.doGet<number>('/count');
  }
}
