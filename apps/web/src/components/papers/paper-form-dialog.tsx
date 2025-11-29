import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from '@quizflow/i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paper, Question } from '@/types'
import { Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { getQuestionTypeLabel, getDifficultyColor } from '@/lib/utils'

interface PaperFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paper?: Paper | null
  onSubmit: (data: any & { question_ids: string[] }) => Promise<void>
}

export function PaperFormDialog({
  open,
  onOpenChange,
  paper,
  onSubmit,
}: PaperFormDialogProps) {
  const { t } = useTranslation(['paper', 'common', 'question'])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Create schema with translations
  const paperSchema = z.object({
    title: z.string().min(1, t('paper:validation.titleRequired')),
    description: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']),
    time_limit: z.number().min(0).optional(),
    shuffle_questions: z.boolean(),
    shuffle_options: z.boolean(),
    show_correct_answer: z.boolean(),
    allow_review: z.boolean(),
  })

  type PaperFormData = z.infer<typeof paperSchema>

  // 获取题目列表
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ['questions', 'all'],
    queryFn: async () => {
      const response = await api.getQuestions({
        limit: 1000,
      }) as { data?: Question[]; count?: number }
      return response.data || []
    },
    enabled: open, // 只在对话框打开时获取
  })

  const questions = questionsData || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaperFormData>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      time_limit: 60,
      shuffle_questions: false,
      shuffle_options: false,
      show_correct_answer: false,
      allow_review: true,
    },
  })

  useEffect(() => {
    if (!open) {
      reset({
        title: '',
        description: '',
        status: 'draft',
        time_limit: 60,
        shuffle_questions: false,
        shuffle_options: false,
        show_correct_answer: false,
        allow_review: true,
      })
      setSelectedQuestionIds(new Set())
      return
    }

    if (paper) {
      // 编辑模式：填充现有数据
      reset({
        title: paper.title,
        description: paper.description || '',
        status: paper.status,
        time_limit: paper.settings.time_limit || 60,
        shuffle_questions: paper.settings.shuffle_questions,
        shuffle_options: paper.settings.shuffle_options,
        show_correct_answer: paper.settings.show_correct_answer,
        allow_review: paper.settings.allow_review,
      })
      setSelectedQuestionIds(new Set(paper.questions.map(q => q.id)))
    } else {
      // 新建模式：使用默认值
      reset({
        title: '',
        description: '',
        status: 'draft',
        time_limit: 60,
        shuffle_questions: false,
        shuffle_options: false,
        show_correct_answer: false,
        allow_review: true,
      })
      setSelectedQuestionIds(new Set())
    }
  }, [paper, open, reset])

  const toggleQuestion = (questionId: string) => {
    const newSet = new Set(selectedQuestionIds)
    if (newSet.has(questionId)) {
      newSet.delete(questionId)
    } else {
      newSet.add(questionId)
    }
    setSelectedQuestionIds(newSet)
  }

  const onFormSubmit = async (data: PaperFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedQuestionIds.size === 0) {
        throw new Error(t('paper:validation.questionsRequired'))
      }

      await onSubmit({
        ...data,
        question_ids: Array.from(selectedQuestionIds),
      })
    } catch (error: any) {
      console.error('提交失败:', error)
      toast({
        title: t('common:message.saveFailed'),
        description: error.message || t('common:message.operationFailed'),
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{paper ? t('paper:action.edit') : t('paper:action.create')}</DialogTitle>
          <DialogDescription>
            {paper ? t('paper:form.description') : t('paper:form.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('paper:form.title')} *
              </label>
              <Input
                {...register('title')}
                placeholder={t('paper:form.titlePlaceholder')}
                className="w-full"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('paper:form.description')}
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder={t('paper:form.descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('paper:status.label')} *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">{t('paper:status.draft')}</option>
                <option value="published">{t('paper:status.published')}</option>
                <option value="archived">{t('paper:status.archived')}</option>
              </select>
            </div>
          </div>

          {/* 试卷设置 */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900">{t('paper:form.title')}</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('paper:form.duration')}
              </label>
              <Input
                type="number"
                {...register('time_limit', { valueAsNumber: true })}
                min={0}
                placeholder={t('paper:form.durationPlaceholder')}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('shuffle_questions')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{t('paper:form.randomOrder')}</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('shuffle_options')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{t('paper:form.randomOrder')}</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('show_correct_answer')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{t('paper:form.showAnswer')}</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('allow_review')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{t('paper:form.allowRetake')}</span>
              </label>
            </div>
          </div>

          {/* 选择题目 */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {t('paper:form.selectQuestions')} ({selectedQuestionIds.size} {t('paper:form.questionsCount', { count: selectedQuestionIds.size })})
              </h3>
              {isLoadingQuestions && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>

            {isLoadingQuestions ? (
              <div className="text-center py-8 text-gray-500">
                {t('common:action.loading')}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('question:list.empty')}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                {questions.map((question) => {
                  const isSelected = selectedQuestionIds.has(question.id)
                  return (
                    <div
                      key={question.id}
                      onClick={() => toggleQuestion(question.id)}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">
                              {getQuestionTypeLabel(question.type)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                              {t(`question:difficulty.${question.difficulty}`)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {question.points} {t('question:form.score')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {question.content}
                          </p>
                        </div>
                        <div className="ml-2">
                          {isSelected ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded border-2 border-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedQuestionIds.size === 0 && (
              <p className="text-sm text-red-500">{t('paper:validation.questionsRequired')}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common:action.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedQuestionIds.size === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common:action.loading')}
                </>
              ) : (
                paper ? t('common:action.save') : t('common:action.create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

