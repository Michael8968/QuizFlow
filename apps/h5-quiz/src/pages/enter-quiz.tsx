import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from '@quizflow/i18n'
import { useQuizStore } from '@/stores/quiz'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrCode, BookOpen, Clock, Users } from 'lucide-react'
import { api } from '@/lib/api'
import type { QuizWithAnswers } from '@quizflow/types'
import { QRScanner } from '@/components/qr-scanner'

// Note: Validation messages are still in Chinese in the schema
// They should be handled by the form validation error display
const enterQuizSchema = z.object({
  quizCode: z.string().min(1),
  studentName: z.string().min(1),
  studentEmail: z.string().email().optional().or(z.literal('')),
})

type EnterQuizForm = z.infer<typeof enterQuizSchema>

// 将数据库格式转换为前端格式
function transformPaperToQuiz(paper: any): QuizWithAnswers {
  const questions = Array.isArray(paper.questions) 
    ? paper.questions.map((q: any, index: number) => ({
        id: q.id || String(index),
        type: q.type,
        content: q.content,
        options: q.options || [],
        answer: q.answer,
        explanation: q.explanation,
        points: q.points || 5,
        order: index + 1,
      }))
    : []

  const settings = typeof paper.settings === 'object' && paper.settings !== null
    ? {
        time_limit: paper.settings.time_limit || undefined,
        shuffle_questions: paper.settings.shuffle_questions || false,
        shuffle_options: paper.settings.shuffle_options || false,
        show_correct_answer: paper.settings.show_correct_answer ?? true,
        allow_review: paper.settings.allow_review ?? true,
      }
    : {
        shuffle_questions: false,
        shuffle_options: false,
        show_correct_answer: true,
        allow_review: true,
      }

  return {
    id: paper.id,
    title: paper.title,
    description: paper.description,
    questions,
    settings,
    quiz_code: paper.quiz_code || '',
    created_at: paper.created_at,
  }
}

export function EnterQuiz() {
  const { t } = useTranslation(['quiz', 'common'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setQuiz, setStudentInfo } = useQuizStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paperInfo, setPaperInfo] = useState<QuizWithAnswers | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EnterQuizForm>({
    resolver: zodResolver(enterQuizSchema),
  })

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)

  const quizCode = watch('quizCode')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 从 URL 参数中读取 code 并填入表单
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setValue('quizCode', codeFromUrl.trim())
    }
  }, [searchParams, setValue])

  // 当考试码变化时，尝试获取试卷信息（带防抖）
  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!quizCode || quizCode.length < 1) {
      setPaperInfo(null)
      setError(null)
      return
    }

    // 设置防抖，500ms 后执行
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setError(null)
        const paper = await api.getPaperByCode(quizCode)
        if (paper) {
          const quiz = transformPaperToQuiz(paper)
          setPaperInfo(quiz)
        } else {
          setPaperInfo(null)
          setError(t('quiz:enter.paperNotFound'))
        }
      } catch (err) {
        setPaperInfo(null)
        setError(err instanceof Error ? err.message : t('common:message.loadingError'))
      }
    }, 500)

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [quizCode])

  const onSubmit = async (data: EnterQuizForm) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const paper = await api.getPaperByCode(data.quizCode)

      if (!paper) {
        setError(t('quiz:enter.paperNotFound'))
        setIsLoading(false)
        return
      }

      const quiz = transformPaperToQuiz(paper)
      setStudentInfo(data.studentName, data.studentEmail || undefined)
      setQuiz(quiz)
      navigate(`/quiz/${quiz.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common:message.loadingError'))
      setIsLoading(false)
    }
  }

  const handleQRScanSuccess = (code: string) => {
    // 将扫描到的二维码内容填入考试码字段
    setValue('quizCode', code.trim())
    setIsQRScannerOpen(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('common:app.name')}</h1>
          <p className="text-gray-600">{t('quiz:enter.title')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('quiz:enter.title')}</CardTitle>
            <CardDescription>
              {t('quiz:enter.paperCodePlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('quiz:enter.paperCode')}
                </label>
                <Input
                  placeholder={t('quiz:enter.paperCodePlaceholder')}
                  {...register('quizCode')}
                  className="mobile-input"
                />
                {errors.quizCode && (
                  <p className="mt-1 text-sm text-red-600">{t('quiz:enter.invalidCode')}</p>
                )}
                {error && !errors.quizCode && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('quiz:info.name')} *
                </label>
                <Input
                  placeholder={t('quiz:info.namePlaceholder')}
                  {...register('studentName')}
                  className="mobile-input"
                />
                {errors.studentName && (
                  <p className="mt-1 text-sm text-red-600">{t('quiz:info.namePlaceholder')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('quiz:info.email')}
                </label>
                <Input
                  type="email"
                  placeholder={t('quiz:info.emailPlaceholder')}
                  {...register('studentEmail')}
                  className="mobile-input"
                />
                {errors.studentEmail && (
                  <p className="mt-1 text-sm text-red-600">{t('quiz:info.emailPlaceholder')}</p>
                )}
              </div>

              <Button
                type="submit"
                className="mobile-button"
                disabled={isLoading}
              >
                {isLoading ? t('common:action.loading') : t('quiz:info.startQuiz')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">{t('common:action.more')}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsQRScannerOpen(true)}
            type="button"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {t('quiz:enter.scanQR')}
          </Button>
        </div>

        {/* 二维码扫描对话框 */}
        <QRScanner
          open={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={handleQRScanSuccess}
        />

        {/* Paper info preview */}
        {paperInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">{paperInfo.title}</CardTitle>
              {paperInfo.description && (
                <CardDescription>{paperInfo.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{t('quiz:info.totalQuestions')}: {paperInfo.questions.length}</span>
                </div>
                {paperInfo.settings.time_limit && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{t('quiz:info.duration')}: {t('quiz:info.durationValue', { minutes: paperInfo.settings.time_limit })}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{t('quiz:info.totalScore')}: {paperInfo.questions.reduce((sum, q) => sum + q.points, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
