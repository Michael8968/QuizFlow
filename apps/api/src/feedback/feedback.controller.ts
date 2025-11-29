import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import type { CreateFeedbackDto, UpdateFeedbackDto, FeedbackStatus } from '@quizflow/types';

@ApiTags('反馈管理')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: '提交反馈' })
  @ApiResponse({ status: 201, description: '提交成功' })
  async create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    const userId = req.user?.id;
    return this.feedbackService.create(userId, createFeedbackDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取反馈列表' })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: FeedbackStatus,
    @Query('type') type?: string,
  ) {
    // 普通用户只能查看自己的反馈
    // TODO: 管理员可以查看所有反馈
    return this.feedbackService.findByUserId(req.user.id, {
      page,
      limit,
      status,
      type,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取反馈统计' })
  async getStats() {
    return this.feedbackService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取反馈详情' })
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新反馈（管理员）' })
  async update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    // TODO: 添加管理员权限检查
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除反馈' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.feedbackService.remove(id, req.user.id);
    return { message: '删除成功' };
  }
}
