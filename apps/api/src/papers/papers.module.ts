import { Module, forwardRef } from '@nestjs/common';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { PaperRepository } from './paper.repository';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [forwardRef(() => QuestionsModule)],
  controllers: [PapersController],
  providers: [PapersService, PaperRepository],
  exports: [PapersService, PaperRepository],
})
export class PapersModule {}
