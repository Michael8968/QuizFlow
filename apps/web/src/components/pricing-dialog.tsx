import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles, Building2, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan?: string
}

// 定价计划配置
const PLANS = [
  {
    id: 'professional',
    name: '专业版',
    icon: Sparkles,
    description: '适合个人教师和小型团队',
    priceMonthly: 49,
    priceYearly: 470,
    features: [
      '1,000 道题目存储',
      '100 份试卷',
      'AI 智能出题',
      '每月 500 次 AI 生成',
      '详细成绩分析',
      '导出 PDF 报告',
      '邮件支持',
    ],
    popular: true,
  },
  {
    id: 'institution',
    name: '机构版',
    icon: Building2,
    description: '适合学校和教育机构',
    priceMonthly: 199,
    priceYearly: 1900,
    features: [
      '10,000 道题目存储',
      '1,000 份试卷',
      'AI 智能出题',
      '每月 2,000 次 AI 生成',
      '10 名团队成员',
      '高级分析报告',
      '优先技术支持',
      '品牌定制',
    ],
    popular: false,
  },
  {
    id: 'ai_enhanced',
    name: 'AI 增强版',
    icon: Zap,
    description: '无限 AI 能力，极致体验',
    priceMonthly: 299,
    priceYearly: 2860,
    features: [
      '5,000 道题目存储',
      '500 份试卷',
      '无限 AI 出题',
      '高级 AI 模型',
      '智能题目推荐',
      '学习路径规划',
      '专属客户经理',
      '24/7 技术支持',
    ],
    popular: false,
  },
]

export function PricingDialog({
  open,
  onOpenChange,
  currentPlan = 'free',
}: PricingDialogProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubscribe = async (planId: string) => {
    if (currentPlan === planId) {
      toast({
        title: '您已订阅此计划',
        description: '如需管理订阅，请前往设置页面',
      })
      return
    }

    setLoadingPlan(planId)
    try {
      const result = await api.createCheckoutSession(planId, billingPeriod)
      if (result.url) {
        // 跳转到 Stripe Checkout
        window.location.href = result.url
      } else {
        throw new Error('未获取到支付链接')
      }
    } catch (error: any) {
      console.error('创建支付会话失败:', error)
      toast({
        title: '操作失败',
        description: error.message || '创建支付会话失败，请重试',
        variant: 'destructive',
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  const formatPrice = (price: number) => {
    return `¥${price}`
  }

  const getYearlySavings = (monthly: number, yearly: number) => {
    const yearlyCost = monthly * 12
    const savings = yearlyCost - yearly
    const percent = Math.round((savings / yearlyCost) * 100)
    return percent
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">选择适合您的计划</DialogTitle>
          <DialogDescription>
            升级后可享受更多功能，随时可以取消订阅
          </DialogDescription>
        </DialogHeader>

        {/* 计费周期切换 */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              月付
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              年付
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                省 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* 价格卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly
            const isCurrentPlan = currentPlan === plan.id
            const savings = getYearlySavings(plan.priceMonthly, plan.priceYearly)

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isCurrentPlan ? 'bg-primary/5' : 'bg-white'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white">最受欢迎</Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{formatPrice(price)}</span>
                    <span className="text-gray-500">
                      /{billingPeriod === 'yearly' ? '年' : '月'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-green-600 mt-1">
                      相比月付节省 {savings}%
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={loadingPlan !== null || isCurrentPlan}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : isCurrentPlan ? (
                    '当前计划'
                  ) : (
                    '立即订阅'
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>所有计划均支持 7 天无理由退款</p>
          <p className="mt-1">
            如有问题，请联系{' '}
            <a href="mailto:support@quiz-flow.com" className="text-primary hover:underline">
              support@quiz-flow.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
