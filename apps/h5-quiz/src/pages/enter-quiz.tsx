import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrCode, BookOpen, Clock, Users } from 'lucide-react'

const enterQuizSchema = z.object({
  quizCode: z.string().min(1, '请输入考试码'),
  studentName: z.string().min(1, '请输入姓名'),
  studentEmail: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
})

type EnterQuizForm = z.infer<typeof enterQuizSchema>

// 模拟数据
const mockQuiz = {
  id: '1',
  title: 'JavaScript 基础测试',
  description: '测试学生对 JavaScript 基础知识的掌握程度',
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      content: '下列哪个是 JavaScript 的基本数据类型？',
      options: ['String', 'Object', 'Array', 'Function'],
      points: 5,
      order: 1,
    },
    {
      id: 'q2',
      type: 'multiple' as const,
      content: '以下哪些是 React 的特点？',
      options: ['虚拟DOM', '组件化', '双向数据绑定', '单向数据流'],
      points: 10,
      order: 2,
    },
    {
      id: 'q3',
      type: 'fill' as const,
      content: '在 CSS 中，使用 _____ 属性可以设置元素的背景颜色。',
      points: 3,
      order: 3,
    },
  ],
  settings: {
    time_limit: 30,
    shuffle_questions: false,
    shuffle_options: false,
    show_correct_answer: true,
    allow_review: true,
  },
  created_at: '2024-01-15T10:30:00Z',
}

export function EnterQuiz() {
  const navigate = useNavigate()
  const { setQuiz } = useQuizStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnterQuizForm>({
    resolver: zodResolver(enterQuizSchema),
  })

  const onSubmit = async (data: EnterQuizForm) => {
    setIsLoading(true)
    
    // 模拟 API 调用
    setTimeout(() => {
      setQuiz(mockQuiz)
      navigate(`/quiz/${mockQuiz.id}`)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QuizFlow</h1>
          <p className="text-gray-600">在线考试系统</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>进入考试</CardTitle>
            <CardDescription>
              输入考试码和您的信息以开始答题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  考试码
                </label>
                <Input
                  placeholder="请输入考试码"
                  {...register('quizCode')}
                  className="mobile-input"
                />
                {errors.quizCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.quizCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <Input
                  placeholder="请输入您的姓名"
                  {...register('studentName')}
                  className="mobile-input"
                />
                {errors.studentName && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱（可选）
                </label>
                <Input
                  type="email"
                  placeholder="请输入您的邮箱"
                  {...register('studentEmail')}
                  className="mobile-input"
                />
                {errors.studentEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentEmail.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="mobile-button"
                disabled={isLoading}
              >
                {isLoading ? '进入中...' : '开始考试'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">或者</p>
          <Button variant="outline" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            扫描二维码进入
          </Button>
        </div>

        {/* 考试信息预览 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">考试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>题目数量: {mockQuiz.questions.length} 题</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-2 h-4 w-4" />
                <span>考试时长: {mockQuiz.settings.time_limit} 分钟</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="mr-2 h-4 w-4" />
                <span>总分: {mockQuiz.questions.reduce((sum, q) => sum + q.points, 0)} 分</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
