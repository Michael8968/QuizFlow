/**
 * 订阅状态
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

/**
 * 完整订阅信息
 */
export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

/**
 * 创建订阅请求
 */
export interface CreateSubscriptionDto {
  plan: string;
}

/**
 * 套餐信息
 */
export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    questions: number;
    papers: number;
    ai_generations: number;
  };
}
