import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('报告管理')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: '获取报告列表' })
  async findAll(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.reportsService.findAll(req.user.id, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报告详情' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Get('paper/:paperId')
  @ApiOperation({ summary: '获取试卷的报告' })
  async findByPaper(@Param('paperId') paperId: string, @Request() req) {
    return this.reportsService.findByPaperId(paperId, req.user.id);
  }

  @Post('paper/:paperId/generate')
  @ApiOperation({ summary: '生成试卷报告' })
  @ApiResponse({ status: 201, description: '生成成功' })
  async generate(@Param('paperId') paperId: string, @Request() req) {
    return this.reportsService.generateReport(paperId, req.user.id);
  }
}
