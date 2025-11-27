import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReportRepository, FindReportsOptions, ReportWithPaper } from './report.repository';
import { PaperRepository } from '../papers/paper.repository';
import { AnswerRepository } from '../answers/answer.repository';
import type { Report, PaginatedResponse } from '@quizflow/types';

export interface CreateReportData {
  paper_id: string;
  summary: Record<string, unknown>;
  chart_data?: Record<string, unknown>;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly paperRepository: PaperRepository,
    private readonly answerRepository: AnswerRepository,
  ) {}

  /**
   * 获取用户的报告列表（分页，带试卷标题）
   */
  async findAll(
    userId: string,
    options?: Omit<FindReportsOptions, 'userId'>,
  ): Promise<PaginatedResponse<ReportWithPaper>> {
    const { data, total } = await this.reportRepository.findByUserIdWithPaper({
      userId,
      ...options,
    });

    const page = options?.page || 1;
    const limit = options?.limit || 20;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个报告
   */
  async findOne(id: string, userId: string): Promise<Report> {
    const report = await this.reportRepository.findById(id);

    if (!report) {
      throw new NotFoundException(`报告不存在: ${id}`);
    }

    if (report.user_id !== userId) {
      throw new ForbiddenException('无权访问此报告');
    }

    return report;
  }

  /**
   * 创建报告
   */
  async create(userId: string, data: CreateReportData): Promise<Report> {
    // 验证试卷所有权
    const belongsToUser = await this.paperRepository.belongsToUser(data.paper_id, userId);
    if (!belongsToUser) {
      throw new ForbiddenException('无权访问此试卷');
    }

    const reportData = {
      ...data,
      user_id: userId,
    };

    return this.reportRepository.create(reportData as unknown as Omit<Report, 'id' | 'created_at' | 'updated_at'>);
  }

  /**
   * 删除报告
   */
  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.reportRepository.delete(id);
  }

  /**
   * 根据试卷 ID 获取报告
   */
  async findByPaperId(paperId: string, userId: string): Promise<Report | null> {
    // 验证试卷所有权
    const belongsToUser = await this.paperRepository.belongsToUser(paperId, userId);
    if (!belongsToUser) {
      throw new ForbiddenException('无权访问此试卷');
    }

    return this.reportRepository.findByPaperId(paperId);
  }

  /**
   * 生成试卷报告
   */
  async generateReport(paperId: string, userId: string): Promise<Report> {
    // 验证试卷所有权
    const belongsToUser = await this.paperRepository.belongsToUser(paperId, userId);
    if (!belongsToUser) {
      throw new ForbiddenException('无权访问此试卷');
    }

    // 获取试卷信息
    const paper = await this.paperRepository.findById(paperId);
    if (!paper) {
      throw new NotFoundException('试卷不存在');
    }

    // 获取答卷统计
    const stats = await this.answerRepository.getStatsByPaperId(paperId);
    const answers = await this.answerRepository.findAllByPaperId(paperId);

    // 生成报告数据
    const summary = {
      paperTitle: paper.title,
      totalAnswers: stats.totalAnswers,
      completedCount: stats.completedCount,
      averageScore: stats.averageScore,
      averageTimeSpent: stats.averageTimeSpent,
      generatedAt: new Date().toISOString(),
    };

    // 生成图表数据
    const chartData = this.generateChartData(answers);

    // 检查是否已有报告，有则更新
    const existingReport = await this.reportRepository.findByPaperId(paperId);
    if (existingReport) {
      return this.reportRepository.update(existingReport.id, {
        summary,
        chart_data: chartData,
      } as unknown as Partial<Report>);
    }

    // 创建新报告
    return this.create(userId, {
      paper_id: paperId,
      summary,
      chart_data: chartData,
    });
  }

  /**
   * 生成图表数据
   */
  private generateChartData(answers: { score?: number; total_score?: number; time_spent?: number }[]): Record<string, unknown> {
    // 分数分布
    const scoreDistribution: Record<string, number> = {
      '0-60': 0,
      '60-70': 0,
      '70-80': 0,
      '80-90': 0,
      '90-100': 0,
    };

    answers.forEach((answer) => {
      if (answer.score !== undefined && answer.total_score && answer.total_score > 0) {
        const percentage = (answer.score / answer.total_score) * 100;
        if (percentage < 60) scoreDistribution['0-60']++;
        else if (percentage < 70) scoreDistribution['60-70']++;
        else if (percentage < 80) scoreDistribution['70-80']++;
        else if (percentage < 90) scoreDistribution['80-90']++;
        else scoreDistribution['90-100']++;
      }
    });

    return {
      scoreDistribution,
      totalResponses: answers.length,
    };
  }
}
