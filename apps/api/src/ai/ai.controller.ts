import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI 功能')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-questions')
  @ApiOperation({ summary: 'AI 生成题目' })
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateQuestions(
    @Body() body: { prompt: string; count: number; type: string },
    @Request() req,
  ) {
    return this.aiService.generateQuestions(body.prompt, body.count, body.type);
  }
}
