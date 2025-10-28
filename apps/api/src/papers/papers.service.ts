import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class PapersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    return this.supabaseService.getPapers(userId);
  }

  async create(userId: string, paperData: any) {
    const data = { ...paperData, user_id: userId };
    return this.supabaseService.createPaper(data);
  }

  async update(id: string, userId: string, paperData: any) {
    return this.supabaseService.updatePaper(id, paperData);
  }

  async remove(id: string, userId: string) {
    return this.supabaseService.deletePaper(id);
  }
}
