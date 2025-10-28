import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class SubscriptionsService {
  constructor(private supabaseService: SupabaseService) {}

  async getSubscription(userId: string) {
    // 获取用户订阅信息
    return { plan: 'free', status: 'active' };
  }

  async createSubscription(userId: string, plan: string) {
    // 创建订阅
    return { plan, status: 'active' };
  }

  async updateSubscription(userId: string, plan: string) {
    // 更新订阅
    return { plan, status: 'active' };
  }
}
