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
import { useTranslation } from '@quizflow/i18n'

export function Home() {
  const { t } = useTranslation('website')

  // 获取 web 应用 URL
  const webAppUrl = import.meta.env.VITE_WEB_URL || 'http://localhost:3000'

  // 跳转到 web 应用
  const handleGoToApp = () => {
    window.open(webAppUrl, '_blank')
  }

  const features = [
    {
      icon: Sparkles,
      title: t('features.ai.title'),
      description: t('features.ai.desc'),
    },
    {
      icon: Smartphone,
      title: t('features.mobile.title'),
      description: t('features.mobile.desc'),
    },
    {
      icon: BarChart3,
      title: t('features.report.title'),
      description: t('features.report.desc'),
    },
    {
      icon: Users,
      title: t('features.share.title'),
      description: t('features.share.desc'),
    },
  ]

  const pricingPlans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      cta: t('pricing.free.cta'),
      highlight: false,
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      period: t('pricing.pro.period'),
      features: t('pricing.pro.features', { returnObjects: true }) as string[],
      cta: t('pricing.pro.cta'),
      highlight: true,
    },
    {
      name: t('pricing.enterprise.name'),
      price: t('pricing.enterprise.price'),
      period: t('pricing.enterprise.period'),
      features: t('pricing.enterprise.features', { returnObjects: true }) as string[],
      cta: t('pricing.enterprise.cta'),
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" onClick={handleGoToApp}>
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                {t('hero.demo')}
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
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('features.subtitle')}
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
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('pricing.subtitle')}
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
                      {t('pricing.pro.popular')}
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
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('cta.subtitle')}
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={handleGoToApp}>
            {t('cta.button')}
          </Button>
        </div>
      </section>
    </div>
  )
}

