import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string, options?: { page?: number; limit?: number; search?: string }) {
    return this.supabaseService.getQuestions(userId, options);
  }

  async create(userId: string, createQuestionDto: CreateQuestionDto) {
    const questionData = {
      ...createQuestionDto,
      user_id: userId,
    };
    return this.supabaseService.createQuestion(questionData);
  }

  async update(id: string, userId: string, updateQuestionDto: UpdateQuestionDto) {
    // 验证题目所有权
    const question = await this.supabaseService
      .getClient()
      .from('questions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (question.data?.user_id !== userId) {
      throw new Error('无权访问此题目');
    }

    return this.supabaseService.updateQuestion(id, updateQuestionDto);
  }

  async remove(id: string, userId: string) {
    // 验证题目所有权
    const question = await this.supabaseService
      .getClient()
      .from('questions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (question.data?.user_id !== userId) {
      throw new Error('无权访问此题目');
    }

    return this.supabaseService.deleteQuestion(id);
  }
}
