import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@quizflow/i18n'

export function Pricing() {
  const { t } = useTranslation('website')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: t('pricing.free.name'),
      description: t('pricing.free.desc'),
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: (t('pricing.free.features', { returnObjects: true }) as string[]).map((name) => ({
        name,
        included: true,
      })).concat([
        { name: t('features.ai.title'), included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'API access', included: false },
        { name: 'Priority support', included: false },
        { name: 'Team collaboration', included: false },
      ]),
      cta: t('pricing.free.cta'),
      highlight: false,
    },
    {
      name: t('pricing.pro.name'),
      description: t('pricing.pro.desc'),
      monthlyPrice: 15,
      yearlyPrice: 144,
      features: (t('pricing.pro.features', { returnObjects: true }) as string[]).map((name) => ({
        name,
        included: true,
      })).concat([
        { name: 'API access', included: false },
        { name: 'Team collaboration', included: false },
        { name: 'Custom branding', included: false },
      ]),
      cta: t('pricing.pro.cta'),
      highlight: true,
    },
    {
      name: t('pricing.enterprise.name'),
      description: t('pricing.enterprise.desc'),
      monthlyPrice: null,
      yearlyPrice: null,
      features: (t('pricing.enterprise.features', { returnObjects: true }) as string[]).map((name) => ({
        name,
        included: true,
      })),
      cta: t('pricing.enterprise.cta'),
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span
              className={`text-sm font-medium ${
                billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {t('pricing.monthly')}
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
              {t('pricing.yearly')}
            </span>
            {billingPeriod === 'yearly' && (
              <span className="text-sm text-green-600 font-semibold">
                {t('pricing.yearlyDiscount')}
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
                    {t('pricing.pro.popular')}
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.monthlyPrice === null ? plan.name : (
                      <>
                        $
                        {billingPeriod === 'monthly'
                          ? plan.monthlyPrice
                          : plan.yearlyPrice}
                      </>
                    )}
                  </span>
                  {plan.monthlyPrice !== null && (
                    <span className="text-gray-600 ml-2">
                      {billingPeriod === 'monthly' ? t('pricing.free.period') : '/year'}
                    </span>
                  )}
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
          <h2 className="text-2xl font-bold text-center mb-8">{t('faq.title')}</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faq.q4.q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('faq.q4.a')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faq.q6.q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('faq.q6.a')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faq.q5.q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('faq.q5.a')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

