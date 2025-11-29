import { Card } from '@/components/ui/card'
import { GraduationCap, User, Building2, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@quizflow/i18n'

export function UseCases() {
  const { t } = useTranslation('website')
  const useCases = [
    {
      icon: GraduationCap,
      title: t('useCases.education.title'),
      painPoint: 'Traditional exam organization is cumbersome, grading workload is heavy, and data analysis is difficult',
      solution: 'Use QuizFlow\'s intelligent paper generation and automatic grading to reduce teacher workload and gain insights into student learning through data analysis',
      results: [
        '90% reduction in paper creation time',
        '10x improvement in grading efficiency',
        'Detailed learning data analysis',
        'Enhanced teaching quality and efficiency',
      ],
    },
    {
      icon: User,
      title: 'Individual Teachers',
      painPoint: 'Time-consuming question creation, lack of data analysis tools, difficulty tracking student progress',
      solution: 'Use AI question generation to quickly create questions, collect data through online quiz system, and automatically generate analysis reports',
      results: [
        'Question creation time reduced from hours to minutes',
        'Real-time student progress tracking',
        'Accurate identification of weak knowledge points',
        'Personalized teaching recommendations',
      ],
    },
    {
      icon: Building2,
      title: t('useCases.enterprise.title'),
      painPoint: 'Training effectiveness is hard to quantify, lack of effective assessment tools, scattered employee learning data',
      solution: 'Build enterprise training question bank through QuizFlow, organize regular online exams, and centrally manage training data and effectiveness evaluation',
      results: [
        'Quantify training effectiveness',
        'Centralized training data management',
        'Identify training priorities and difficulties',
        'Improve training ROI',
      ],
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('useCases.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('useCases.subtitle')}
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="space-y-12">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <Card key={index} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {useCase.title}
                      </h2>
                    </div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">
                          Pain Points
                        </h3>
                        <p className="text-gray-700">{useCase.painPoint}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">
                          Solution
                        </h3>
                        <p className="text-gray-700">{useCase.solution}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-600 mb-3">
                          Results
                        </h3>
                        <ul className="space-y-2">
                          {useCase.results.map((result, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

