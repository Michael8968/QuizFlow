import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('题目管理')
@Controller('questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: '获取题目列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.questionsService.findAll(req.user.id, { page, limit, search });
  }

  @Post()
  @ApiOperation({ summary: '创建题目' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Request() req, @Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(req.user.id, createQuestionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新题目' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, req.user.id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除题目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.questionsService.remove(id, req.user.id);
  }
}
