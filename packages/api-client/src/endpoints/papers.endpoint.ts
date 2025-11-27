import { BaseEndpoint } from './base.endpoint';
import type { ApiClient, ClientApiResponse } from '../client';
import type { Paper, PaperStatus, PaperSettings, PaginatedResponse } from '@quizflow/types';

/**
 * 创建试卷请求参数
 */
export interface CreatePaperRequest {
  title: string;
  description?: string;
  settings?: PaperSettings;
  question_ids?: string[];
  status?: PaperStatus;
}

/**
 * 更新试卷请求参数
 */
export interface UpdatePaperRequest extends Partial<CreatePaperRequest> {}

/**
 * 查询试卷参数
 */
export interface QueryPapersParams {
  page?: number;
  limit?: number;
  status?: PaperStatus;
  search?: string;
}

/**
 * 试卷相关 API
 */
export class PapersEndpoint extends BaseEndpoint {
  constructor(client: ApiClient) {
    super(client, '/papers');
  }

  /**
   * 获取试卷列表
   */
  async list(params?: QueryPapersParams): Promise<ClientApiResponse<PaginatedResponse<Paper>>> {
    return this.doGet<PaginatedResponse<Paper>>('', { params });
  }

  /**
   * 获取单个试卷
   */
  async getById(id: string): Promise<ClientApiResponse<Paper>> {
    return this.doGet<Paper>(`/${id}`);
  }

  /**
   * 根据考试码获取试卷（公开接口）
   */
  async getByCode(code: string): Promise<ClientApiResponse<Paper>> {
    return this.doGet<Paper>(`/code/${code}`);
  }

  /**
   * 创建试卷
   */
  async create(data: CreatePaperRequest): Promise<ClientApiResponse<Paper>> {
    return this.doPost<Paper>('', data);
  }

  /**
   * 更新试卷
   */
  async update(id: string, data: UpdatePaperRequest): Promise<ClientApiResponse<Paper>> {
    return this.doPatch<Paper>(`/${id}`, data);
  }

  /**
   * 删除试卷
   */
  async remove(id: string): Promise<ClientApiResponse<void>> {
    return this.doDelete<void>(`/${id}`);
  }

  /**
   * 发布试卷
   */
  async publish(id: string): Promise<ClientApiResponse<Paper>> {
    return this.doPost<Paper>(`/${id}/publish`);
  }

  /**
   * 归档试卷
   */
  async archive(id: string): Promise<ClientApiResponse<Paper>> {
    return this.doPost<Paper>(`/${id}/archive`);
  }

  /**
   * 统计试卷数量
   */
  async count(): Promise<ClientApiResponse<number>> {
    return this.doGet<number>('/count');
  }
}
