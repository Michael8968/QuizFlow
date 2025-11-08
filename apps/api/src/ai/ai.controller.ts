import { Controller, Post, Body, UseGuards, Request, ForbiddenException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI 功能')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('generate-questions')
  @ApiOperation({ summary: 'AI 生成题目（仅专业版及以上可用）' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiResponse({ status: 403, description: '需要专业版及以上订阅' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async generateQuestions(
    @Body() body: { prompt: string; count: number; type: string },
    @Request() req,
  ) {
    // 验证请求参数
    if (!body.prompt || !body.prompt.trim()) {
      throw new BadRequestException('出题提示不能为空');
    }

    if (!body.count || body.count < 1 || body.count > 20) {
      throw new BadRequestException('题目数量必须在 1-20 之间');
    }

    if (!body.type || !['single', 'multiple', 'fill', 'essay'].includes(body.type)) {
      throw new BadRequestException('题目类型无效');
    }

    // 检查用户订阅计划
    const userPlan = req.user?.plan;
    const allowedPlans = ['professional', 'institution', 'ai_enhanced'];
    
    if (!allowedPlans.includes(userPlan)) {
      throw new ForbiddenException('AI 出题功能需要专业版及以上订阅，请升级您的账户');
    }

    try {
      return await this.aiService.generateQuestions(
        body.prompt.trim(),
        body.count,
        body.type,
        req.user.id
      );
    } catch (error) {
      this.logger.error('生成题目失败', error.stack);
      
      // 如果是已知的业务错误，直接抛出
      if (error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      
      // 其他错误包装为内部服务器错误
      throw new InternalServerErrorException(
        error.message || 'AI 生成题目失败，请稍后重试'
      );
    }
  }
}
