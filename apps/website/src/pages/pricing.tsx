import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: '免费版',
      description: '适合个人用户和小规模使用',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { name: '最多50道题目', included: true },
        { name: '最多10份试卷', included: true },
        { name: '基础报告分析', included: true },
        { name: 'H5在线答卷', included: true },
        { name: '社区支持', included: true },
        { name: 'AI智能出题', included: false },
        { name: '高级报告分析', included: false },
        { name: 'API访问', included: false },
        { name: '优先支持', included: false },
        { name: '团队协作', included: false },
      ],
      cta: '立即开始',
      highlight: false,
    },
    {
      name: '专业版',
      description: '适合专业教师和中小型机构',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        { name: '无限题目', included: true },
        { name: '无限试卷', included: true },
        { name: '基础报告分析', included: true },
        { name: 'H5在线答卷', included: true },
        { name: 'AI智能出题', included: true },
        { name: '高级报告分析', included: true },
        { name: '优先支持', included: true },
        { name: 'API访问', included: false },
        { name: '团队协作', included: false },
        { name: '自定义品牌', included: false },
      ],
      cta: '升级专业版',
      highlight: true,
    },
    {
      name: '机构版',
      description: '适合大型教育机构和企业',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        { name: '无限题目', included: true },
        { name: '无限试卷', included: true },
        { name: '基础报告分析', included: true },
        { name: 'H5在线答卷', included: true },
        { name: 'AI智能出题', included: true },
        { name: '高级报告分析', included: true },
        { name: '优先支持', included: true },
        { name: 'API访问', included: true },
        { name: '团队协作', included: true },
        { name: '自定义品牌', included: true },
        { name: '专属客服', included: true },
      ],
      cta: '联系销售',
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            选择适合您的套餐
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            灵活的定价方案，满足不同规模的需求
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span
              className={`text-sm font-medium ${
                billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              月付
            </span>
            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === 'monthly' ? 'yearly' : 'monthly'
                )
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              年付
            </span>
            {billingPeriod === 'yearly' && (
              <span className="text-sm text-green-600 font-semibold">
                节省17%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.highlight
                  ? 'border-primary border-2 shadow-lg scale-105'
                  : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    推荐
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ¥
                    {billingPeriod === 'monthly'
                      ? plan.monthlyPrice
                      : plan.yearlyPrice}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingPeriod === 'monthly' ? '月' : '年'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">可以随时取消订阅吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  是的，您可以随时取消订阅。取消后，您仍然可以使用服务直到当前计费周期结束。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">年付有优惠吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  是的，选择年付可以节省17%的费用，相当于免费使用2个月。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">支持退款吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  我们提供30天退款保证。如果您在30天内对服务不满意，可以申请全额退款。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

