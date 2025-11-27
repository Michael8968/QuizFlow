import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { SubmitAnswerDto, UpdateScoreDto, QueryAnswersDto } from './dto/answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('答卷管理')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('submit')
  @ApiOperation({ summary: '提交答卷（公开端点，学生使用）' })
  @ApiResponse({ status: 201, description: '提交成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '试卷不存在' })
  async submit(@Body() dto: SubmitAnswerDto) {
    return this.answersService.submit(dto);
  }

  @Get('paper/:paperId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取试卷的答卷列表' })
  async findByPaper(
    @Param('paperId') paperId: string,
    @Query() query: QueryAnswersDto,
    @Request() req,
  ) {
    return this.answersService.findAll(paperId, req.user.id, query);
  }

  @Get('paper/:paperId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取试卷的答卷统计' })
  async getStats(@Param('paperId') paperId: string, @Request() req) {
    return this.answersService.getStats(paperId, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取单个答卷详情' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.answersService.findOne(id, req.user.id);
  }

  @Patch(':id/score')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新答卷分数' })
  async updateScore(
    @Param('id') id: string,
    @Body() dto: UpdateScoreDto,
    @Request() req,
  ) {
    return this.answersService.updateScore(id, req.user.id, dto.score, dto.total_score);
  }
}
