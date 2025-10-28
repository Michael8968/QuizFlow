import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class AnswersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(paperId: string) {
    return this.supabaseService.getAnswers(paperId);
  }

  async create(answerData: any) {
    return this.supabaseService.createAnswer(answerData);
  }

  async update(id: string, answerData: any) {
    return this.supabaseService.updateAnswer(id, answerData);
  }
}
