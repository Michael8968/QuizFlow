import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, User, Building2, CheckCircle2 } from 'lucide-react'

export function UseCases() {
  const useCases = [
    {
      icon: GraduationCap,
      title: '教育机构',
      painPoint: '传统考试组织繁琐，阅卷工作量大，数据分析困难',
      solution: '使用QuizFlow的智能组卷和自动评分功能，大幅减少教师工作量，通过数据分析报告深入了解学生学习情况',
      results: [
        '组卷时间减少90%',
        '阅卷效率提升10倍',
        '获得详细的学习数据分析',
        '提升教学质量和效率',
      ],
    },
    {
      icon: User,
      title: '教师个人',
      painPoint: '出题耗时，缺乏数据分析工具，难以跟踪学生学习进度',
      solution: '利用AI智能出题功能快速生成题目，通过在线答卷系统收集数据，自动生成分析报告',
      results: [
        '出题时间从数小时缩短到几分钟',
        '实时跟踪学生学习进度',
        '精准识别薄弱知识点',
        '个性化教学建议',
      ],
    },
    {
      icon: Building2,
      title: '企业培训',
      painPoint: '培训效果难以量化，缺乏有效的评估工具，员工学习数据分散',
      solution: '通过QuizFlow建立企业培训题库，定期组织在线考试，统一管理培训数据和效果评估',
      results: [
        '量化培训效果',
        '统一管理培训数据',
        '识别培训重点和难点',
        '提升培训ROI',
      ],
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            使用场景
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            无论您是教育机构、教师个人还是企业，QuizFlow 都能满足您的需求
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
                          痛点
                        </h3>
                        <p className="text-gray-700">{useCase.painPoint}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">
                          解决方案
                        </h3>
                        <p className="text-gray-700">{useCase.solution}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-600 mb-3">
                          成果
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

