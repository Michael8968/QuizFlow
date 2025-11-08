import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  Smartphone, 
  BarChart3, 
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export function Home() {
  const features = [
    {
      icon: Sparkles,
      title: '智能出题（AI）',
      description: '利用AI技术自动生成高质量题目，节省90%的出题时间',
    },
    {
      icon: Smartphone,
      title: 'H5 在线答卷',
      description: '完美适配手机、平板等移动设备，随时随地参与答题',
    },
    {
      icon: BarChart3,
      title: '自动评分 + 报告分析',
      description: '自动评分并生成详细的数据分析报告，洞察学习效果',
    },
    {
      icon: Users,
      title: 'SaaS 订阅 + 多端支持',
      description: '灵活的订阅模式，支持多端协作，团队高效协作',
    },
  ]

  const pricingPlans = [
    {
      name: '免费版',
      price: '¥0',
      period: '永久免费',
      features: ['最多50道题目', '最多10份试卷', '基础报告分析', '社区支持'],
      cta: '立即开始',
      highlight: false,
    },
    {
      name: '专业版',
      price: '¥99',
      period: '每月',
      features: ['无限题目', '无限试卷', 'AI智能出题', '高级报告分析', '优先支持'],
      cta: '升级专业版',
      highlight: true,
    },
    {
      name: '机构版',
      price: '¥499',
      period: '每月',
      features: ['所有专业版功能', '团队协作', '自定义品牌', 'API访问', '专属客服'],
      cta: '联系销售',
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            QuizFlow — AI‑Powered Intelligent Quiz & Assessment Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, publish and analyze quizzes in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                免费试用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                查看功能
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              核心亮点
            </h2>
            <p className="text-lg text-gray-600">
              强大的功能，让您的测验管理变得简单高效
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              选择适合您的套餐
            </h2>
            <p className="text-lg text-gray-600">
              灵活的定价方案，满足不同规模的需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
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
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing" className="block">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            立即注册，免费试用所有功能
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              立即开始免费试用
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

