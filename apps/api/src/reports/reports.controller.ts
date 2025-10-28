import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
  async findAll(@Request() req) {
    return this.reportsService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '生成报告' })
  async create(@Body() reportData: any) {
    return this.reportsService.create(reportData);
  }
}
