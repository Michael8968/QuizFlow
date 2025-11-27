import { Module, forwardRef } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportRepository } from './report.repository';
import { PapersModule } from '../papers/papers.module';
import { AnswersModule } from '../answers/answers.module';

@Module({
  imports: [
    forwardRef(() => PapersModule),
    forwardRef(() => AnswersModule),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportRepository],
  exports: [ReportsService, ReportRepository],
})
export class ReportsModule {}
