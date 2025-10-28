import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    return this.supabaseService.getReports(userId);
  }

  async create(reportData: any) {
    return this.supabaseService.createReport(reportData);
  }
}
