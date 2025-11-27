import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { QuestionRepository, FindQuestionsOptions } from './question.repository';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import type { Question, PaginatedResponse } from '@quizflow/types';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  /**
   * 获取用户的题目列表（分页）
   */
  async findAll(
    userId: string,
    options?: Omit<FindQuestionsOptions, 'userId'>,
  ): Promise<PaginatedResponse<Question>> {
    const { data, total } = await this.questionRepository.findByUserId({
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
   * 获取单个题目
   */
  async findOne(id: string, userId: string): Promise<Question> {
    const question = await this.questionRepository.findById(id);

    if (!question) {
      throw new NotFoundException(`题目不存在: ${id}`);
    }

    if (question.user_id !== userId) {
      throw new ForbiddenException('无权访问此题目');
    }

    return question;
  }

  /**
   * 创建题目
   */
  async create(userId: string, dto: CreateQuestionDto): Promise<Question> {
    this.validateQuestionData(dto);

    return this.questionRepository.create({
      ...dto,
      user_id: userId,
    } as Omit<Question, 'id' | 'created_at' | 'updated_at'>);
  }

  /**
   * 更新题目
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateQuestionDto,
  ): Promise<Question> {
    // 先验证权限
    await this.findOne(id, userId);

    if (Object.keys(dto).length > 0) {
      this.validateQuestionData(dto);
    }

    return this.questionRepository.update(id, dto as Partial<Question>);
  }

  /**
   * 删除题目
   */
  async remove(id: string, userId: string): Promise<void> {
    // 先验证权限
    await this.findOne(id, userId);
    await this.questionRepository.delete(id);
  }

  /**
   * 批量获取题目
   */
  async findByIds(ids: string[], userId: string): Promise<Question[]> {
    const questions = await this.questionRepository.findByIds(ids);

    // 验证所有题目都属于当前用户
    const unauthorized = questions.filter((q) => q.user_id !== userId);
    if (unauthorized.length > 0) {
      throw new ForbiddenException('部分题目无权访问');
    }

    return questions;
  }

  /**
   * 获取用户的所有标签
   */
  async getTags(userId: string): Promise<string[]> {
    return this.questionRepository.getTagsByUserId(userId);
  }

  /**
   * 统计用户的题目数量
   */
  async count(userId: string): Promise<number> {
    return this.questionRepository.countByUserId(userId);
  }

  /**
   * 验证题目数据的业务规则
   */
  private validateQuestionData(dto: Partial<CreateQuestionDto>): void {
    // 选择题必须有选项
    if (dto.type && ['single', 'multiple'].includes(dto.type)) {
      if (!dto.options || dto.options.length < 2) {
        throw new BadRequestException('选择题至少需要 2 个选项');
      }
    }

    // 多选题答案必须是数组格式（用逗号分隔的字符串或数组）
    if (dto.type === 'multiple' && dto.answer) {
      // 如果 answer 是字符串，检查是否包含多个答案
      if (typeof dto.answer === 'string' && !dto.answer.includes(',')) {
        throw new BadRequestException('多选题答案必须包含多个选项');
      }
    }
  }
}
