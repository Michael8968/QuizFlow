import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('答卷管理')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('public')
  @ApiOperation({ summary: '提交答卷（公开端点）' })
  @ApiResponse({ status: 201, description: '提交成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createPublic(@Body() answerData: any) {
    return this.answersService.create(answerData);
  }

  @Get(':paperId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取试卷答卷列表' })
  async findAll(@Param('paperId') paperId: string) {
    return this.answersService.findAll(paperId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交答卷' })
  async create(@Body() answerData: any) {
    return this.answersService.create(answerData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新答卷' })
  async update(@Param('id') id: string, @Body() answerData: any) {
    return this.answersService.update(id, answerData);
  }
}
