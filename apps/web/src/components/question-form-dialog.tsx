import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Question } from '@/types'
import { Plus, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const questionSchema = z.object({
  type: z.enum(['single', 'multiple', 'fill', 'essay']),
  content: z.string().min(1, '题目内容不能为空'),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1, '答案不能为空'),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.number().min(1).max(100),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface QuestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question?: Question | null
  onSubmit: (data: Omit<QuestionFormData, 'tags' | 'options'> & { tags: string[], options?: string[] }) => Promise<void>
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  question,
  onSubmit,
}: QuestionFormDialogProps) {
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [tags, setTags] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: 'single',
      content: '',
      answer: '',
      explanation: '',
      difficulty: 'medium',
      points: 5,
    },
  })

  const questionType = watch('type')
  const isChoiceType = questionType === 'single' || questionType === 'multiple'

  useEffect(() => {
    if (!open) {
      // 对话框关闭时重置表单
      reset({
        type: 'single',
        content: '',
        answer: '',
        explanation: '',
        difficulty: 'medium',
        points: 5,
      })
      setOptions(['', '', '', ''])
      setTags([''])
      return
    }

    if (question) {
      // 编辑模式：填充现有数据
      reset({
        type: question.type,
        content: question.content,
        answer: Array.isArray(question.answer) ? question.answer.join(',') : question.answer,
        explanation: question.explanation || '',
        difficulty: question.difficulty,
        points: question.points,
      })
      if (question.options) {
        setOptions([...question.options, ...Array(4 - question.options.length).fill('')].slice(0, 4))
      } else {
        setOptions(['', '', '', ''])
      }
      if (question.tags && question.tags.length > 0) {
        setTags(question.tags)
      } else {
        setTags([''])
      }
    } else {
      // 新建模式：使用默认值
      reset({
        type: 'single',
        content: '',
        answer: '',
        explanation: '',
        difficulty: 'medium',
        points: 5,
      })
      setOptions(['', '', '', ''])
      setTags([''])
    }
  }, [question, open, reset])

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addTag = () => {
    setTags([...tags, ''])
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags]
    newTags[index] = value
    setTags(newTags)
  }

  const onFormSubmit = async (data: QuestionFormData) => {
    console.log('onFormSubmit', data)
    setIsSubmitting(true)
    try {
      const validOptions = isChoiceType ? options.filter(opt => opt.trim() !== '') : undefined
      const validTags = tags.filter(tag => tag.trim() !== '')

      if (isChoiceType && (!validOptions || validOptions.length < 2)) {
        throw new Error('选择题至少需要2个选项')
      }

      if (validTags.length === 0) {
        throw new Error('至少需要一个标签')
      }

      // 处理答案格式：多选题答案需要转换为字符串
      const answerValue = data.answer.trim()
      
      await onSubmit({
        ...data,
        answer: answerValue,
        options: validOptions,
        tags: validTags,
      })
      // 成功时由父组件处理对话框关闭和状态重置
    } catch (error: any) {
      console.error('提交失败:', error)
      toast({
        title: '提交失败',
        description: error.message || '提交失败，请重试',
        variant: 'destructive',
      })
      throw error // 重新抛出错误，让父组件也能处理
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? '编辑题目' : '添加题目'}</DialogTitle>
          <DialogDescription>
            {question ? '修改题目信息' : '创建一道新题目'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题目类型 *
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="fill">填空题</option>
              <option value="essay">问答题</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题目内容 *
            </label>
            <textarea
              {...register('content')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入题目内容..."
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>

          {isChoiceType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选项 *
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    添加选项
                  </Button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              正确答案 *
            </label>
            <Input
              {...register('answer')}
              placeholder={isChoiceType ? '例如：A 或 A,B' : '请输入正确答案'}
            />
            {errors.answer && (
              <p className="text-sm text-red-500 mt-1">{errors.answer.message}</p>
            )}
            {isChoiceType && (
              <p className="text-xs text-gray-500 mt-1">
                单选题输入选项字母（如：A），多选题用逗号分隔（如：A,B,C）
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              答案解析
            </label>
            <textarea
              {...register('explanation')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入答案解析（可选）..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                难度 *
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分值 *
              </label>
              <Input
                type="number"
                {...register('points', { valueAsNumber: true })}
                min={1}
                max={100}
              />
              {errors.points && (
                <p className="text-sm text-red-500 mt-1">{errors.points.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签 *
            </label>
            <div className="space-y-2">
              {tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="标签"
                  />
                  {tags.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
              >
                <Plus className="mr-2 h-4 w-4" />
                添加标签
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : question ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

