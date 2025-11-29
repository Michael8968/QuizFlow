import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReportRepository, FindReportsOptions, ReportWithPaper } from './report.repository';
import { PaperRepository } from '../papers/paper.repository';
import { AnswerRepository } from '../answers/answer.repository';
import type { Report, PaginatedResponse, Answer, Question } from '@quizflow/types';

export interface CreateReportData {
  paper_id: string;
  summary: Record<string, unknown>;
  chart_data?: Record<string, unknown>;
}

interface AnswerWithResponses extends Answer {
  responses: Record<string, string | string[]>;
  time_spent?: number;
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

    // 获取答卷统计和详细数据
    const answers = await this.answerRepository.findAllByPaperId(paperId) as AnswerWithResponses[];
    const completedAnswers = answers.filter(a => a.status === 'completed' || a.status === 'graded');

    // 计算统计数据
    const totalStudents = new Set(answers.map(a => a.student_email || a.student_name || a.id)).size;

    const averageScore = completedAnswers.length > 0
      ? completedAnswers.reduce((sum, a) => {
          if (a.total_score && a.total_score > 0) {
            return sum + (a.score / a.total_score) * 100;
          }
          return sum;
        }, 0) / completedAnswers.length
      : 0;

    // 计算及格率 (>=60%)
    const passCount = completedAnswers.filter(a => {
      if (a.total_score && a.total_score > 0) {
        return (a.score / a.total_score) * 100 >= 60;
      }
      return false;
    }).length;
    const passRate = completedAnswers.length > 0 ? (passCount / completedAnswers.length) * 100 : 0;

    // 计算完成率
    const completionRate = answers.length > 0 ? (completedAnswers.length / answers.length) * 100 : 0;

    // 生成报告摘要
    const summary = {
      total_students: totalStudents,
      average_score: Math.round(averageScore * 10) / 10,
      pass_rate: Math.round(passRate * 10) / 10,
      completion_rate: Math.round(completionRate * 10) / 10,
      paper_title: paper.title,
      total_questions: paper.questions?.length || 0,
      generated_at: new Date().toISOString(),
    };

    // 生成图表数据
    const chartData = this.generateChartData(completedAnswers, paper.questions || []);

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
  private generateChartData(
    answers: AnswerWithResponses[],
    questions: Question[],
  ): Record<string, unknown> {
    // 1. 分数分布 (5个区间)
    const scoreDistribution = [
      { score: '0-20', count: 0 },
      { score: '21-40', count: 0 },
      { score: '41-60', count: 0 },
      { score: '61-80', count: 0 },
      { score: '81-100', count: 0 },
    ];

    answers.forEach((answer) => {
      if (answer.score !== undefined && answer.total_score && answer.total_score > 0) {
        const percentage = (answer.score / answer.total_score) * 100;
        if (percentage <= 20) scoreDistribution[0].count++;
        else if (percentage <= 40) scoreDistribution[1].count++;
        else if (percentage <= 60) scoreDistribution[2].count++;
        else if (percentage <= 80) scoreDistribution[3].count++;
        else scoreDistribution[4].count++;
      }
    });

    // 2. 题目正确率分析
    const questionAnalysis = questions.map((question, index) => {
      let correctCount = 0;
      let totalAttempts = 0;

      answers.forEach((answer) => {
        const userAnswer = answer.responses?.[question.id];
        if (userAnswer !== undefined && userAnswer !== null) {
          totalAttempts++;
          if (this.checkAnswerCorrect(question, userAnswer)) {
            correctCount++;
          }
        }
      });

      return {
        question_id: question.id,
        question_index: index + 1,
        correct_rate: totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0,
        total_attempts: totalAttempts,
        correct_count: correctCount,
      };
    });

    // 3. 答题时间分布
    const timeAnalysis = [
      { time_range: '0-10min', count: 0 },
      { time_range: '10-20min', count: 0 },
      { time_range: '20-30min', count: 0 },
      { time_range: '30-40min', count: 0 },
      { time_range: '40-50min', count: 0 },
      { time_range: '50-60min', count: 0 },
      { time_range: '>60min', count: 0 },
    ];

    answers.forEach((answer) => {
      if (answer.time_spent && answer.time_spent > 0) {
        const minutes = answer.time_spent / 60;
        if (minutes <= 10) timeAnalysis[0].count++;
        else if (minutes <= 20) timeAnalysis[1].count++;
        else if (minutes <= 30) timeAnalysis[2].count++;
        else if (minutes <= 40) timeAnalysis[3].count++;
        else if (minutes <= 50) timeAnalysis[4].count++;
        else if (minutes <= 60) timeAnalysis[5].count++;
        else timeAnalysis[6].count++;
      }
    });

    // 4. 难度分布
    const difficultyDistribution = {
      easy: 0,
      medium: 0,
      hard: 0,
    };
    questions.forEach((q) => {
      const difficulty = q.difficulty || 'medium';
      difficultyDistribution[difficulty]++;
    });

    return {
      score_distribution: scoreDistribution,
      question_analysis: questionAnalysis,
      time_analysis: timeAnalysis,
      difficulty_distribution: difficultyDistribution,
      total_responses: answers.length,
    };
  }

  /**
   * 检查答案是否正确
   */
  private checkAnswerCorrect(question: Question, userAnswer: string | string[]): boolean {
    const correctAnswer = question.answer;

    if (question.type === 'single') {
      return String(userAnswer).trim() === String(correctAnswer).trim();
    } else if (question.type === 'multiple') {
      const userArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      if (userArray.length !== correctArray.length) return false;
      return userArray.every(ans => correctArray.includes(String(ans).trim()));
    } else if (question.type === 'fill') {
      const userText = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
      const correctText = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
      return String(userText).trim().toLowerCase() === String(correctText).trim().toLowerCase();
    }

    return false;
  }
}
