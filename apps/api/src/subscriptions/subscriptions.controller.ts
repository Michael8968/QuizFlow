import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  RawBodyRequest,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService, PRICING_PLANS } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Stripe from 'stripe';

@ApiTags('订阅管理')
@Controller('subscriptions')
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  @Get('plans')
  @ApiOperation({ summary: '获取价格列表' })
  @ApiResponse({ status: 200, description: '返回所有订阅计划' })
  getPlans() {
    return {
      plans: PRICING_PLANS,
      currency: 'CNY',
      currencySymbol: '¥',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户订阅信息' })
  @ApiResponse({ status: 200, description: '返回订阅信息' })
  async getSubscription(@Request() req: any) {
    const subscription = await this.subscriptionsService.getSubscription(req.user.id);
    return {
      subscription,
      currentPlan: req.user.plan || 'free',
    };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建支付会话' })
  @ApiResponse({ status: 200, description: '返回 Stripe Checkout Session' })
  async createCheckoutSession(
    @Request() req: any,
    @Body() body: { plan: string; billingPeriod?: 'monthly' | 'yearly' },
  ) {
    const validPlans = Object.keys(PRICING_PLANS);
    if (!validPlans.includes(body.plan)) {
      throw new BadRequestException(`无效的订阅计划，可选值: ${validPlans.join(', ')}`);
    }

    return this.subscriptionsService.createCheckoutSession(
      req.user.id,
      req.user.email,
      body.plan as keyof typeof PRICING_PLANS,
      body.billingPeriod || 'monthly',
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建客户门户会话（管理订阅）' })
  @ApiResponse({ status: 200, description: '返回 Stripe Customer Portal URL' })
  async createPortalSession(@Request() req: any) {
    return this.subscriptionsService.createPortalSession(req.user.id);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消订阅（周期结束后生效）' })
  @ApiResponse({ status: 200, description: '订阅取消成功' })
  async cancelSubscription(@Request() req: any) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }

  @Post('resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '恢复已取消的订阅' })
  @ApiResponse({ status: 200, description: '订阅恢复成功' })
  async resumeSubscription(@Request() req: any) {
    return this.subscriptionsService.resumeSubscription(req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook 处理' })
  @ApiResponse({ status: 200, description: 'Webhook 处理成功' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() req: RawBodyRequest<Request>,
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe 未配置');
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook Secret 未配置');
    }

    let event: Stripe.Event;

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('请求体为空');
      }

      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook 签名验证失败: ${err.message}`);
      throw new BadRequestException(`Webhook 签名验证失败: ${err.message}`);
    }

    this.logger.log(`接收到 Stripe Webhook: ${event.type}`);

    await this.subscriptionsService.handleWebhookEvent(event);

    return { received: true };
  }
}
