import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Database,
  Sparkles,
  Smartphone,
  BarChart3,
  CreditCard,
  Users
} from 'lucide-react'
import questionImage from '@/assets/image/question.jpg'
import questionVideo from '@/assets/video/question.mp4'
import paperImage from '@/assets/image/paper.png'
import paperVideo from '@/assets/video/paper.mp4'
import answerImage from '@/assets/image/answer.png'
import answerVideo from '@/assets/video/answer.mp4'
import reportImage from '@/assets/image/report.png'
import reportVideo from '@/assets/video/report.mp4'
import subscriptionImage from '@/assets/image/subscription.jpg'
import collaborationImage from '@/assets/image/collaboration.jpg'
import { useTranslation } from '@quizflow/i18n'

export function Features() {
  const { t } = useTranslation('website')
  const features = [
    {
      icon: Database,
      title: '题库管理 & 导入',
      description: '强大的题库管理系统，支持批量导入、分类管理、标签筛选。支持多种格式导入（Excel、Word、CSV），让您的题目管理变得轻松简单。',
      details: [
        '批量导入题目，支持Excel、Word、CSV格式',
        '智能分类和标签系统',
        '题目搜索和筛选功能',
        '题目版本管理和历史记录',
      ],
      video: questionVideo,
      image: questionImage,
    },
    {
      icon: Sparkles,
      title: '智能组卷',
      description: '基于AI技术的智能组卷功能，根据难度、知识点、题型等条件自动生成试卷，大大提升组卷效率。',
      details: [
        'AI智能推荐题目',
        '自定义组卷规则（难度、知识点、题型）',
        '一键生成多套试卷',
        '试卷预览和编辑',
      ],
      video: paperVideo,
      image: paperImage,
    },
    {
      icon: Smartphone,
      title: '在线答卷系统（H5适配）',
      description: '完美适配手机、平板等移动设备的在线答卷系统，支持多种题型，提供流畅的答题体验。',
      details: [
        '完美适配移动设备（手机、平板）',
        '支持单选题、多选题、填空题、问答题',
        '实时保存答题进度',
        '倒计时和自动提交功能',
      ],
      video: answerVideo,
      image: answerImage,
    },
    {
      icon: BarChart3,
      title: '成绩分析报告',
      description: '自动评分并生成详细的数据分析报告，包括成绩分布、知识点掌握情况、错题分析等，帮助您深入了解学习效果。',
      details: [
        '自动评分和成绩统计',
        '成绩分布图表分析',
        '知识点掌握情况分析',
        '错题分析和改进建议',
      ],
      video: reportVideo,
      image: reportImage,
    },
    {
      icon: CreditCard,
      title: '订阅管理',
      description: '灵活的订阅管理系统，支持多种套餐选择，自动续费，发票管理等功能。',
      details: [
        '多种订阅套餐选择',
        '自动续费管理',
        '发票和账单管理',
        '使用量统计和提醒',
      ],
      video: undefined,
      image: subscriptionImage,
    },
    {
      icon: Users,
      title: '多端协作',
      description: '支持团队协作，多用户管理，权限控制，让团队高效协作。',
      details: [
        '团队成员管理',
        '角色和权限控制',
        '协作编辑和评论',
        '数据共享和同步',
      ],
      video: undefined,
      image: collaborationImage,
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 items-center`}
              >
                <div className="flex-1">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <div className="rounded-lg aspect-video overflow-hidden bg-gray-100">
                    {feature.video ? (
                      <video
                        className="w-full h-full object-cover"
                        poster={feature.image}
                        controls={false}
                        preload="metadata"
                        loop
                        muted
                        autoPlay
                      >
                        <source src={feature.video} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                    ) : (
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

