import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * 数据库模块
 * 提供 Supabase 客户端服务
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class DatabaseModule {}
