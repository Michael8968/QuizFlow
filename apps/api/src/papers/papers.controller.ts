import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PapersService } from './papers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('试卷管理')
@Controller('papers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Get()
  @ApiOperation({ summary: '获取试卷列表' })
  async findAll(@Request() req) {
    return this.papersService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '创建试卷' })
  async create(@Request() req, @Body() paperData: any) {
    return this.papersService.create(req.user.id, paperData);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新试卷' })
  async update(@Param('id') id: string, @Request() req, @Body() paperData: any) {
    return this.papersService.update(id, req.user.id, paperData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除试卷' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.papersService.remove(id, req.user.id);
  }
}
