import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('订阅管理')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: '获取订阅信息' })
  async getSubscription(@Request() req: any) {
    return this.subscriptionsService.getSubscription(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '创建订阅' })
  async createSubscription(@Request() req: any, @Body() body: { plan: string }) {
    return this.subscriptionsService.createSubscription(req.user.id, body.plan);
  }
}
