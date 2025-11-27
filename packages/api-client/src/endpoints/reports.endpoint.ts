import { BaseEndpoint } from './base.endpoint';
import type { ApiClient, ClientApiResponse } from '../client';
import type { Report, PaginatedResponse } from '@quizflow/types';

/**
 * 报告（带试卷标题）
 */
export interface ReportWithPaper extends Report {
  paper_title?: string;
}

/**
 * 查询报告参数
 */
export interface QueryReportsParams {
  page?: number;
  limit?: number;
}

/**
 * 报告相关 API
 */
export class ReportsEndpoint extends BaseEndpoint {
  constructor(client: ApiClient) {
    super(client, '/reports');
  }

  /**
   * 获取报告列表
   */
  async list(params?: QueryReportsParams): Promise<ClientApiResponse<PaginatedResponse<ReportWithPaper>>> {
    return this.doGet<PaginatedResponse<ReportWithPaper>>('', { params });
  }

  /**
   * 获取单个报告
   */
  async getById(id: string): Promise<ClientApiResponse<Report>> {
    return this.doGet<Report>(`/${id}`);
  }

  /**
   * 根据试卷获取报告
   */
  async getByPaper(paperId: string): Promise<ClientApiResponse<Report | null>> {
    return this.doGet<Report | null>(`/paper/${paperId}`);
  }

  /**
   * 生成试卷报告
   */
  async generate(paperId: string): Promise<ClientApiResponse<Report>> {
    return this.doPost<Report>(`/paper/${paperId}/generate`);
  }

  /**
   * 删除报告
   */
  async remove(id: string): Promise<ClientApiResponse<void>> {
    return this.doDelete<void>(`/${id}`);
  }
}
