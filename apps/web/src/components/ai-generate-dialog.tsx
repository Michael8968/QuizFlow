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
import { Loader2, Sparkles, Check, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Question } from '@/types'

interface AiGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestionsGenerated: (questions: Question[]) => void
  userPlan?: string
}

// 常用提示模板
const PROMPT_TEMPLATES = [
  {
    title: 'JavaScript 基础',
    prompt: '关于 JavaScript 基础知识的题目，包括变量、数据类型、函数、数组、对象等内容',
  },
  {
    title: 'React 框架',
    prompt: '关于 React 前端框架的题目，包括组件、Hooks、状态管理、生命周期等内容',
  },
  {
    title: '计算机网络',
    prompt: '关于计算机网络的题目，包括 HTTP 协议、TCP/IP、DNS、网络安全等内容',
  },
  {
    title: '数据库基础',
    prompt: '关于数据库的题目，包括 SQL 语法、索引、事务、数据库设计等内容',
  },
  {
    title: '算法与数据结构',
    prompt: '关于算法和数据结构的题目，包括排序、查找、树、图、动态规划等内容',
  },
  {
    title: '操作系统',
    prompt: '关于操作系统的题目，包括进程管理、内存管理、文件系统、并发等内容',
  },
]

type Step = 'input' | 'preview'

export function AiGenerateDialog({
  open,
  onOpenChange,
  onQuestionsGenerated,
  userPlan,
}: AiGenerateDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [count, setCount] = useState(5)
  const [type, setType] = useState('single')
  const [difficulty, setDifficulty] = useState('medium')
  const [tags, setTags] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const isProfessional = ['professional', 'institution', 'ai_enhanced'].includes(userPlan || '')

  const resetForm = () => {
    setPrompt('')
    setCount(5)
    setType('single')
    setDifficulty('medium')
    setTags('')
    setStep('input')
    setGeneratedQuestions([])
    setSelectedQuestions(new Set())
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

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
      // 构建增强的提示词
      const enhancedPrompt = buildEnhancedPrompt()

      const response = await api.generateQuestions(enhancedPrompt, count, type) as {
        questions?: any[]
      }

      if (!response.questions || response.questions.length === 0) {
        throw new Error('AI 未生成任何题目')
      }

      // 转换AI生成的题目格式为系统格式
      const formattedQuestions: Question[] = response.questions.map((q: any) => ({
        id: '',
        user_id: '',
        type: q.type || type,
        content: q.content || '',
        options: q.options || [],
        answer: q.answer || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        points: q.points || 5,
        tags: mergeTags(q.tags, tags),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      setGeneratedQuestions(formattedQuestions)
      // 默认全选
      setSelectedQuestions(new Set(formattedQuestions.map((_, i) => i)))
      setStep('preview')

      toast({
        title: '生成成功',
        description: `成功生成 ${formattedQuestions.length} 道题目，请预览并选择要保存的题目`,
      })
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

  const buildEnhancedPrompt = () => {
    let enhanced = prompt.trim()

    // 添加难度要求
    const difficultyMap: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    }
    enhanced += `\n\n要求难度：${difficultyMap[difficulty] || '中等'}`

    // 添加标签提示
    if (tags.trim()) {
      enhanced += `\n相关知识点/标签：${tags.trim()}`
    }

    return enhanced
  }

  const mergeTags = (aiTags: string[] | undefined, userTags: string): string[] => {
    const result: string[] = ['AI生成']
    if (aiTags && Array.isArray(aiTags)) {
      result.push(...aiTags)
    }
    if (userTags.trim()) {
      const customTags = userTags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
      result.push(...customTags)
    }
    // 去重
    return [...new Set(result)]
  }

  const toggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedQuestions(newSelected)
  }

  const selectAll = () => {
    setSelectedQuestions(new Set(generatedQuestions.map((_, i) => i)))
  }

  const deselectAll = () => {
    setSelectedQuestions(new Set())
  }

  const handleSave = () => {
    const questionsToSave = generatedQuestions.filter((_, i) => selectedQuestions.has(i))
    if (questionsToSave.length === 0) {
      toast({
        title: '请选择题目',
        description: '请至少选择一道题目保存',
        variant: 'destructive',
      })
      return
    }

    onQuestionsGenerated(questionsToSave)
    handleClose()
  }

  const handleBack = () => {
    setStep('input')
  }

  const applyTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt)
  }

  const getTypeLabel = (t: string) => {
    const labels: Record<string, string> = {
      single: '单选题',
      multiple: '多选题',
      fill: '填空题',
      essay: '问答题',
    }
    return labels[t] || t
  }

  const getDifficultyLabel = (d: string) => {
    const labels: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    }
    return labels[d] || d
  }

  const getDifficultyColor = (d: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    }
    return colors[d] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 智能出题
            {step === 'preview' && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - 预览与选择
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'input'
              ? (isProfessional
                ? '输入出题提示，AI 将为您自动生成题目'
                : 'AI 出题功能需要专业版及以上订阅')
              : `已生成 ${generatedQuestions.length} 道题目，请选择要保存的题目`
            }
          </DialogDescription>
        </DialogHeader>

        {!isProfessional && step === 'input' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              您当前使用的是免费版，AI 出题功能需要升级到专业版。
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                handleClose()
                window.location.href = '/settings'
              }}
            >
              前往升级
            </Button>
          </div>
        )}

        {step === 'input' && (
          <div className="space-y-4">
            {/* 提示模板 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                快速模板
              </label>
              <div className="flex flex-wrap gap-2">
                {PROMPT_TEMPLATES.map((template) => (
                  <Button
                    key={template.title}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    disabled={!isProfessional || isGenerating}
                    className="text-xs"
                  >
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>

            {/* 出题提示 */}
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
                请详细描述您希望生成的题目主题、范围和要求
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 题目数量 */}
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

              {/* 题目类型 */}
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

              {/* 难度选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  题目难度
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!isProfessional || isGenerating}
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>

              {/* 自定义标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自定义标签
                </label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="用逗号分隔，如：前端,基础"
                  disabled={!isProfessional || isGenerating}
                />
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {/* 选择操作 */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <span className="text-sm text-gray-600">
                已选择 {selectedQuestions.size} / {generatedQuestions.length} 道题目
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  全选
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  取消全选
                </Button>
              </div>
            </div>

            {/* 题目列表 */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {generatedQuestions.map((question, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedQuestions.has(index)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
                      selectedQuestions.has(index)
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300'
                    }`}>
                      {selectedQuestions.has(index) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">
                          第 {index + 1} 题
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {getTypeLabel(question.type)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyLabel(question.difficulty)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {question.points} 分
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{question.content}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {question.options.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className={`text-xs ${
                                question.answer?.includes(String.fromCharCode(65 + optIndex))
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-600'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {question.answer?.includes(String.fromCharCode(65 + optIndex)) && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <span className="font-medium">解析：</span>{question.explanation}
                        </div>
                      )}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {question.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step === 'preview' ? (
            <>
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                返回修改
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={selectedQuestions.size === 0}
                >
                  <Check className="mr-1 h-4 w-4" />
                  保存选中 ({selectedQuestions.size})
                </Button>
              </div>
            </>
          ) : (
            <>
              <div />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
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
                      生成题目
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
