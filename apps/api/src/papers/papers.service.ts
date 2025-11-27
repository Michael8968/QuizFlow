import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PaperRepository, FindPapersOptions } from './paper.repository';
import { QuestionRepository } from '../questions/question.repository';
import { CreatePaperDto, UpdatePaperDto } from './dto/paper.dto';
import type { Paper, PaperStatus, PaginatedResponse } from '@quizflow/types';

@Injectable()
export class PapersService {
  constructor(
    private readonly paperRepository: PaperRepository,
    private readonly questionRepository: QuestionRepository,
  ) {}

  /**
   * 获取用户的试卷列表（分页）
   */
  async findAll(
    userId: string,
    options?: Omit<FindPapersOptions, 'userId'>,
  ): Promise<PaginatedResponse<Paper>> {
    const { data, total } = await this.paperRepository.findByUserId({
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
   * 获取单个试卷
   */
  async findOne(id: string, userId: string): Promise<Paper> {
    const paper = await this.paperRepository.findById(id);

    if (!paper) {
      throw new NotFoundException(`试卷不存在: ${id}`);
    }

    if (paper.user_id !== userId) {
      throw new ForbiddenException('无权访问此试卷');
    }

    return paper;
  }

  /**
   * 创建试卷
   */
  async create(userId: string, dto: CreatePaperDto): Promise<Paper> {
    // 验证题目是否存在且属于当前用户
    if (dto.question_ids?.length) {
      const questions = await this.questionRepository.findByIds(dto.question_ids);

      if (questions.length !== dto.question_ids.length) {
        throw new BadRequestException('部分题目不存在');
      }

      const unauthorized = questions.filter((q) => q.user_id !== userId);
      if (unauthorized.length > 0) {
        throw new ForbiddenException('部分题目无权访问');
      }
    }

    // 如果状态是 published，需要生成考试码
    let quizCode: string | undefined;
    if (dto.status === 'published') {
      quizCode = await this.paperRepository.generateUniqueQuizCode();
    }

    const paperData = {
      title: dto.title,
      description: dto.description,
      settings: dto.settings,
      question_ids: dto.question_ids,
      status: dto.status || 'draft',
      user_id: userId,
      quiz_code: quizCode,
      questions: [], // questions will be populated by the database relation
    };

    return this.paperRepository.create(paperData as unknown as Omit<Paper, 'id' | 'created_at' | 'updated_at'>);
  }

  /**
   * 更新试卷
   */
  async update(
    id: string,
    userId: string,
    dto: UpdatePaperDto,
  ): Promise<Paper> {
    // 先验证权限
    const existingPaper = await this.findOne(id, userId);

    // 如果更新了题目列表，验证题目
    if (dto.question_ids?.length) {
      const questions = await this.questionRepository.findByIds(dto.question_ids);

      if (questions.length !== dto.question_ids.length) {
        throw new BadRequestException('部分题目不存在');
      }

      const unauthorized = questions.filter((q) => q.user_id !== userId);
      if (unauthorized.length > 0) {
        throw new ForbiddenException('部分题目无权访问');
      }
    }

    // 如果状态变为 published 且没有考试码，生成一个
    const updateData: Partial<Paper> = { ...dto } as Partial<Paper>;
    if (dto.status === 'published' && !existingPaper.quiz_code) {
      updateData.quiz_code = await this.paperRepository.generateUniqueQuizCode();
    }

    return this.paperRepository.update(id, updateData);
  }

  /**
   * 删除试卷
   */
  async remove(id: string, userId: string): Promise<void> {
    // 先验证权限
    await this.findOne(id, userId);
    await this.paperRepository.delete(id);
  }

  /**
   * 根据考试码查找试卷（公开接口，学生端使用）
   */
  async findByCode(quizCode: string): Promise<Paper> {
    const paper = await this.paperRepository.findByQuizCode(quizCode);

    if (!paper) {
      throw new NotFoundException('试卷不存在或未发布');
    }

    return paper;
  }

  /**
   * 发布试卷
   */
  async publish(id: string, userId: string): Promise<Paper> {
    // 先验证权限
    await this.findOne(id, userId);
    return this.paperRepository.updateStatus(id, 'published');
  }

  /**
   * 归档试卷
   */
  async archive(id: string, userId: string): Promise<Paper> {
    // 先验证权限
    await this.findOne(id, userId);
    return this.paperRepository.updateStatus(id, 'archived');
  }

  /**
   * 统计用户的试卷数量
   */
  async count(userId: string): Promise<number> {
    return this.paperRepository.countByUserId(userId);
  }
}
