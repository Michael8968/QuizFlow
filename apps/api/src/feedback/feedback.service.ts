import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FeedbackRepository, FindFeedbacksOptions } from './feedback.repository';
import type { Feedback, CreateFeedbackDto, UpdateFeedbackDto, PaginatedResponse } from '@quizflow/types';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  /**
   * 获取反馈列表（分页）
   */
  async findAll(options?: FindFeedbacksOptions): Promise<PaginatedResponse<Feedback>> {
    const { data, total } = await this.feedbackRepository.findAll(options);

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
   * 获取用户的反馈列表
   */
  async findByUserId(userId: string, options?: Omit<FindFeedbacksOptions, 'userId'>): Promise<PaginatedResponse<Feedback>> {
    const { data, total } = await this.feedbackRepository.findByUserId(userId, options);

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
   * 获取单个反馈
   */
  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findById(id);

    if (!feedback) {
      throw new NotFoundException(`反馈不存在: ${id}`);
    }

    return feedback;
  }

  /**
   * 创建反馈
   */
  async create(userId: string | undefined, data: CreateFeedbackDto): Promise<Feedback> {
    const feedbackData = {
      ...data,
      user_id: userId,
      status: 'pending' as const,
    };

    return this.feedbackRepository.create(feedbackData as unknown as Omit<Feedback, 'id' | 'created_at' | 'updated_at'>);
  }

  /**
   * 更新反馈（管理员用）
   */
  async update(id: string, data: UpdateFeedbackDto): Promise<Feedback> {
    const feedback = await this.findOne(id);

    return this.feedbackRepository.update(id, data as unknown as Partial<Feedback>);
  }

  /**
   * 删除反馈
   */
  async remove(id: string, userId?: string, isAdmin = false): Promise<void> {
    const feedback = await this.findOne(id);

    // 非管理员只能删除自己的反馈
    if (!isAdmin && feedback.user_id !== userId) {
      throw new ForbiddenException('无权删除此反馈');
    }

    await this.feedbackRepository.delete(id);
  }

  /**
   * 获取反馈统计
   */
  async getStats() {
    return this.feedbackRepository.getStats();
  }
}
