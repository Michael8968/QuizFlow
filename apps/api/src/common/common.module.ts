import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { JwtService } from './jwt.service';

@Module({
  providers: [SupabaseService, JwtService],
  exports: [SupabaseService, JwtService],
})
export class CommonModule {}
