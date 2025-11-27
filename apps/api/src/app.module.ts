import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { PapersModule } from './papers/papers.module';
import { AnswersModule } from './answers/answers.module';
import { ReportsModule } from './reports/reports.module';
import { AiModule } from './ai/ai.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        '../../.env.local',
        '../../.env',
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 分钟
        limit: 100, // 限制 100 次请求
      },
    ]),
    DatabaseModule,
    CommonModule,
    AuthModule,
    QuestionsModule,
    PapersModule,
    AnswersModule,
    ReportsModule,
    AiModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
