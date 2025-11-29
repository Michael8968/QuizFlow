import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import Stripe from 'stripe';

// 定价计划配置
export const PRICING_PLANS = {
  professional: {
    name: '专业版',
    nameEn: 'Professional',
    priceMonthly: 4900, // 分为单位，即 ¥49
    priceYearly: 47000, // ¥470/年（约8折）
    currency: 'cny',
    features: {
      questions: 1000,
      papers: 100,
      aiEnabled: true,
      aiQuestionsPerMonth: 500,
    },
  },
  institution: {
    name: '机构版',
    nameEn: 'Institution',
    priceMonthly: 19900, // ¥199
    priceYearly: 190000, // ¥1900/年
    currency: 'cny',
    features: {
      questions: 10000,
      papers: 1000,
      aiEnabled: true,
      aiQuestionsPerMonth: 2000,
      teamMembers: 10,
    },
  },
  ai_enhanced: {
    name: 'AI增强版',
    nameEn: 'AI Enhanced',
    priceMonthly: 29900, // ¥299
    priceYearly: 286000, // ¥2860/年
    currency: 'cny',
    features: {
      questions: 5000,
      papers: 500,
      aiEnabled: true,
      aiQuestionsPerMonth: -1, // 无限
      advancedAI: true,
    },
  },
};

export type PlanType = keyof typeof PRICING_PLANS | 'free';

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id?: string | null;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: Stripe | null = null;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      this.logger.log('Stripe 客户端初始化成功');
    } else {
      this.logger.warn('STRIPE_SECRET_KEY 未配置，支付功能将无法使用');
    }
  }

  /**
   * 获取价格列表
   */
  getPricingPlans() {
    return PRICING_PLANS;
  }

  /**
   * 获取用户订阅信息
   */
  async getSubscription(userId: string): Promise<Subscription | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error('获取订阅信息失败', error);
      throw new BadRequestException('获取订阅信息失败');
    }

    return data as Subscription | null;
  }

  /**
   * 创建 Stripe Checkout Session
   */
  async createCheckoutSession(
    userId: string,
    userEmail: string,
    plan: keyof typeof PRICING_PLANS,
    billingPeriod: 'monthly' | 'yearly' = 'monthly',
  ) {
    if (!this.stripe) {
      throw new BadRequestException('支付服务未配置');
    }

    const planConfig = PRICING_PLANS[plan];
    if (!planConfig) {
      throw new BadRequestException('无效的订阅计划');
    }

    const supabase = this.supabaseService.getClient();

    // 查找或创建 Stripe Customer
    let stripeCustomerId: string | undefined;

    // 检查用户是否已有 Stripe Customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    if (existingSub?.stripe_customer_id) {
      stripeCustomerId = existingSub.stripe_customer_id;
    } else {
      // 创建新的 Stripe Customer
      const customer = await this.stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      });
      stripeCustomerId = customer.id;
    }

    const price = billingPeriod === 'yearly' ? planConfig.priceYearly : planConfig.priceMonthly;
    const interval = billingPeriod === 'yearly' ? 'year' : 'month';

    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';

    // 创建 Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      payment_method_options: {
        wechat_pay: {
          client: 'web',
        },
      },
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: `QuizFlow ${planConfig.name}`,
              description: `${planConfig.name} - ${billingPeriod === 'yearly' ? '年付' : '月付'}`,
            },
            unit_amount: price,
            recurring: {
              interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${webUrl}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${webUrl}/settings?canceled=true`,
      metadata: {
        userId,
        plan,
        billingPeriod,
      },
    });

    this.logger.log(`创建 Checkout Session: ${session.id} for user ${userId}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * 创建 Customer Portal Session（管理订阅）
   */
  async createPortalSession(userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('支付服务未配置');
    }

    const subscription = await this.getSubscription(userId);
    if (!subscription?.stripe_customer_id) {
      throw new BadRequestException('未找到订阅信息');
    }

    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${webUrl}/settings`,
    });

    return {
      url: session.url,
    };
  }

  /**
   * 处理 Stripe Webhook 事件
   */
  async handleWebhookEvent(event: Stripe.Event) {
    const supabase = this.supabaseService.getClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }

      default:
        this.logger.log(`未处理的 webhook 事件类型: ${event.type}`);
    }
  }

  /**
   * 处理支付完成
   */
  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const supabase = this.supabaseService.getClient();
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as keyof typeof PRICING_PLANS;

    if (!userId || !plan) {
      this.logger.error('Checkout session 缺少必要的 metadata', session.id);
      return;
    }

    // 获取订阅详情
    const stripeSubscription = await this.stripe!.subscriptions.retrieve(
      session.subscription as string,
    );

    // 创建或更新订阅记录
    const { error: subError } = await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        status: 'active',
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: session.customer as string,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      },
    );

    if (subError) {
      this.logger.error('更新订阅记录失败', subError);
    }

    // 更新用户的 plan 字段
    const { error: userError } = await supabase
      .from('users')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (userError) {
      this.logger.error('更新用户 plan 失败', userError);
    }

    this.logger.log(`用户 ${userId} 订阅成功: ${plan}`);
  }

  /**
   * 处理订阅更新
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const supabase = this.supabaseService.getClient();

    // 根据 stripe_subscription_id 查找订阅
    const { data: subData, error: findError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (findError || !subData) {
      this.logger.error('未找到对应的订阅记录', subscription.id);
      return;
    }

    const status = this.mapStripeStatus(subscription.status);

    // 更新订阅状态
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (updateError) {
      this.logger.error('更新订阅状态失败', updateError);
    }

    this.logger.log(`订阅 ${subscription.id} 状态更新: ${status}`);
  }

  /**
   * 处理订阅取消/删除
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const supabase = this.supabaseService.getClient();

    // 根据 stripe_subscription_id 查找订阅
    const { data: subData, error: findError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (findError || !subData) {
      this.logger.error('未找到对应的订阅记录', subscription.id);
      return;
    }

    // 更新订阅状态为 canceled
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (subError) {
      this.logger.error('更新订阅状态失败', subError);
    }

    // 将用户降级为免费版
    const { error: userError } = await supabase
      .from('users')
      .update({ plan: 'free', updated_at: new Date().toISOString() })
      .eq('id', subData.user_id);

    if (userError) {
      this.logger.error('降级用户 plan 失败', userError);
    }

    this.logger.log(`用户 ${subData.user_id} 订阅已取消，降级为免费版`);
  }

  /**
   * 处理支付失败
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const supabase = this.supabaseService.getClient();

    if (!invoice.subscription) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription as string);

    if (error) {
      this.logger.error('更新订阅状态失败', error);
    }

    this.logger.log(`订阅 ${invoice.subscription} 支付失败，状态更新为 past_due`);
  }

  /**
   * 映射 Stripe 订阅状态
   */
  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): 'active' | 'canceled' | 'past_due' | 'trialing' {
    switch (status) {
      case 'active':
        return 'active';
      case 'canceled':
      case 'unpaid':
        return 'canceled';
      case 'past_due':
        return 'past_due';
      case 'trialing':
        return 'trialing';
      default:
        return 'active';
    }
  }

  /**
   * 取消订阅（在当前周期结束后）
   */
  async cancelSubscription(userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('支付服务未配置');
    }

    const subscription = await this.getSubscription(userId);
    if (!subscription?.stripe_subscription_id) {
      throw new BadRequestException('未找到有效订阅');
    }

    await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    const supabase = this.supabaseService.getClient();
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    this.logger.log(`用户 ${userId} 已请求取消订阅`);

    return { message: '订阅将在当前周期结束后取消' };
  }

  /**
   * 恢复已取消的订阅
   */
  async resumeSubscription(userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('支付服务未配置');
    }

    const subscription = await this.getSubscription(userId);
    if (!subscription?.stripe_subscription_id) {
      throw new BadRequestException('未找到有效订阅');
    }

    await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    const supabase = this.supabaseService.getClient();
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    this.logger.log(`用户 ${userId} 已恢复订阅`);

    return { message: '订阅已恢复' };
  }
}
