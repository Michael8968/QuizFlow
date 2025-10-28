import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('答卷管理')
@Controller('answers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get(':paperId')
  @ApiOperation({ summary: '获取试卷答卷列表' })
  async findAll(@Param('paperId') paperId: string) {
    return this.answersService.findAll(paperId);
  }

  @Post()
  @ApiOperation({ summary: '提交答卷' })
  async create(@Body() answerData: any) {
    return this.answersService.create(answerData);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新答卷' })
  async update(@Param('id') id: string, @Body() answerData: any) {
    return this.answersService.update(id, answerData);
  }
}
