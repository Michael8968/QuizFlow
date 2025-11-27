import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './question.repository';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionRepository],
  exports: [QuestionsService, QuestionRepository],
})
export class QuestionsModule {}
