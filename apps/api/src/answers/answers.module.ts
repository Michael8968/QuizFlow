import { Module, forwardRef } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { AnswerRepository } from './answer.repository';
import { PapersModule } from '../papers/papers.module';

@Module({
  imports: [forwardRef(() => PapersModule)],
  controllers: [AnswersController],
  providers: [AnswersService, AnswerRepository],
  exports: [AnswersService, AnswerRepository],
})
export class AnswersModule {}
