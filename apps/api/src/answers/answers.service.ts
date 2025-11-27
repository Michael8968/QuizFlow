import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AnswerRepository, FindAnswersOptions, AnswerStats } from './answer.repository';
import { PaperRepository } from '../papers/paper.repository';
import { SubmitAnswerDto } from './dto/answer.dto';
import type { Answer, PaginatedResponse } from '@quizflow/types';

@Injectable()
export class AnswersService {
  constructor(
    private readonly answerRepository: AnswerRepository,
    private readonly paperRepository: PaperRepository,
  ) {}

  /**
   * 获取试卷的答卷列表（分页）
   */
  async findAll(
    paperId: string,
    userId: string,
    options?: Omit<FindAnswersOptions, 'paperId'>,
  ): Promise<PaginatedResponse<Answer>> {
    // 验证试卷所有权
    await this.validatePaperOwnership(paperId, userId);

    const { data, total } = await this.answerRepository.findByPaperId(paperId, options);

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
   * 获取试卷的所有答卷（不分页）
   */
  async findAllByPaper(paperId: string, userId: string): Promise<Answer[]> {
    await this.validatePaperOwnership(paperId, userId);
    return this.answerRepository.findAllByPaperId(paperId);
  }

  /**
   * 获取单个答卷
   */
  async findOne(id: string, userId: string): Promise<Answer> {
    const answer = await this.answerRepository.findById(id);

    if (!answer) {
      throw new NotFoundException(`答卷不存在: ${id}`);
    }

    // 验证试卷所有权
    await this.validatePaperOwnership(answer.paper_id, userId);

    return answer;
  }

  /**
   * 学生提交答卷
   */
  async submit(dto: SubmitAnswerDto): Promise<Answer> {
    // 根据考试码查找试卷
    const paper = await this.paperRepository.findByQuizCode(dto.quiz_code);

    if (!paper) {
      throw new NotFoundException('试卷不存在或未发布');
    }

    // 检查是否允许重复提交
    if (dto.student_email) {
      const hasSubmitted = await this.answerRepository.hasSubmitted(
        dto.student_email,
        paper.id,
      );
      if (hasSubmitted) {
        throw new BadRequestException('您已提交过此试卷');
      }
    }

    // 创建答卷
    const answerData = {
      paper_id: paper.id,
      student_name: dto.student_name,
      student_email: dto.student_email,
      responses: dto.responses,
      time_spent: dto.time_spent,
      status: 'completed' as const,
      score: 0,
      total_score: 0,
      started_at: new Date().toISOString(),
    };

    return this.answerRepository.create(answerData as unknown as Omit<Answer, 'id' | 'created_at' | 'updated_at'>);
  }

  /**
   * 更新答卷
   */
  async update(
    id: string,
    userId: string,
    data: Partial<Answer>,
  ): Promise<Answer> {
    await this.findOne(id, userId);
    return this.answerRepository.update(id, data);
  }

  /**
   * 更新答卷分数
   */
  async updateScore(
    id: string,
    userId: string,
    score: number,
    totalScore: number,
  ): Promise<Answer> {
    await this.findOne(id, userId);
    return this.answerRepository.updateScore(id, score, totalScore);
  }

  /**
   * 获取试卷的答卷统计
   */
  async getStats(paperId: string, userId: string): Promise<AnswerStats> {
    await this.validatePaperOwnership(paperId, userId);
    return this.answerRepository.getStatsByPaperId(paperId);
  }

  /**
   * 统计试卷的答卷数量
   */
  async count(paperId: string, userId: string): Promise<number> {
    await this.validatePaperOwnership(paperId, userId);
    return this.answerRepository.countByPaperId(paperId);
  }

  /**
   * 验证试卷所有权
   */
  private async validatePaperOwnership(paperId: string, userId: string): Promise<void> {
    const belongsToUser = await this.paperRepository.belongsToUser(paperId, userId);
    if (!belongsToUser) {
      throw new ForbiddenException('无权访问此试卷');
    }
  }
}
