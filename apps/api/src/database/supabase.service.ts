import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 服务
 * 只负责提供 Supabase 客户端实例
 */
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new Error('Missing Supabase configuration: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }

    this.client = createClient(url, key);
  }

  /**
   * 获取 Supabase 客户端实例
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}
