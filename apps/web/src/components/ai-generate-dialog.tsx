import { useState } from 'react'
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
import { Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Question } from '@/types'

interface AiGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestionsGenerated: (questions: Question[]) => void
  userPlan?: string
}

export function AiGenerateDialog({
  open,
  onOpenChange,
  onQuestionsGenerated,
  userPlan,
}: AiGenerateDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [count, setCount] = useState(5)
  const [type, setType] = useState('single')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const isProfessional = ['professional', 'institution', 'ai_enhanced'].includes(userPlan || '')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: '提示不能为空',
        description: '请输入出题提示内容',
        variant: 'destructive',
      })
      return
    }

    if (count < 1 || count > 20) {
      toast({
        title: '题目数量无效',
        description: '题目数量应在1-20之间',
        variant: 'destructive',
      })
      return
    }

    if (!isProfessional) {
      toast({
        title: '需要专业版',
        description: 'AI 出题功能需要专业版及以上订阅，请前往设置页面升级',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await api.generateQuestions(prompt, count, type) as {
        questions?: any[]
      }

      if (!response.questions || response.questions.length === 0) {
        throw new Error('AI 未生成任何题目')
      }

      // 转换AI生成的题目格式为系统格式
      const formattedQuestions: Question[] = response.questions.map((q: any) => ({
        id: '', // 将在保存时生成
        user_id: '',
        type: q.type || type,
        content: q.content || '',
        options: q.options || [],
        answer: q.answer || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        points: q.points || 5,
        tags: q.tags || ['AI生成'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      onQuestionsGenerated(formattedQuestions)
      toast({
        title: '生成成功',
        description: `成功生成 ${formattedQuestions.length} 道题目`,
      })
      onOpenChange(false)
      // 重置表单
      setPrompt('')
      setCount(5)
    } catch (error: any) {
      console.error('AI 生成失败:', error)
      toast({
        title: '生成失败',
        description: error.message || 'AI 生成题目失败，请重试',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 智能出题
          </DialogTitle>
          <DialogDescription>
            {isProfessional
              ? '输入出题提示，AI 将为您自动生成题目'
              : 'AI 出题功能需要专业版及以上订阅'}
          </DialogDescription>
        </DialogHeader>

        {!isProfessional && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              您当前使用的是免费版，AI 出题功能需要升级到专业版。
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                onOpenChange(false)
                window.location.href = '/settings'
              }}
            >
              前往升级
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出题提示 *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例如：关于JavaScript基础知识的单选题，包括变量、函数、数组等内容..."
              disabled={!isProfessional || isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              请详细描述您希望生成的题目主题、范围和类型
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                题目数量 *
              </label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min={1}
                max={20}
                disabled={!isProfessional || isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">1-20 道</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                题目类型 *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!isProfessional || isGenerating}
              >
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="fill">填空题</option>
                <option value="essay">问答题</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            取消
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!isProfessional || isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                开始生成
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

