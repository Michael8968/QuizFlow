import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, Loader2, Sparkles, FileUp } from 'lucide-react'
import { api } from '@/lib/api'
import { Question } from '@/types'
import { QuestionFormDialog } from '@/components/question-form-dialog'
import { QuestionDetailDialog } from '@/components/question-detail-dialog'
import { QuestionCard } from '@/components/question-card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AiGenerateDialog } from '@/components/ai-generate-dialog'
import { ImportExportDialog } from '@/components/import-export-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/auth-provider'

export function Questions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isImportExportDialogOpen, setIsImportExportDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // 获取题目列表
  const { data, isLoading, error } = useQuery<Question[]>({
    queryKey: ['questions', searchTerm],
    queryFn: async () => {
      const response = await api.getQuestions({
        search: searchTerm || undefined,
        limit: 100,
      }) as { data?: Question[]; count?: number }
      return response.data || []
    },
  })

  // 创建题目
  const createMutation = useMutation({
    mutationFn: async (questionData: any) => {
      return api.createQuestion(questionData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast({
        title: '成功',
        description: '题目创建成功',
      })
      setIsFormDialogOpen(false)
      setEditingQuestion(null)
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.message || '创建题目失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 更新题目
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.updateQuestion(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast({
        title: '成功',
        description: '题目更新成功',
      })
      setIsFormDialogOpen(false)
      setEditingQuestion(null)
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error.message || '更新题目失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 删除题目
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.deleteQuestion(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast({
        title: '成功',
        description: '题目删除成功',
      })
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.message || '删除题目失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 批量创建题目（用于AI生成的题目）
  const batchCreateMutation = useMutation({
    mutationFn: async (questions: Question[]) => {
      const results = []
      for (const question of questions) {
        try {
          const result = await api.createQuestion({
            type: question.type,
            content: question.content,
            options: question.options,
            answer: question.answer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            points: question.points,
            tags: question.tags,
          })
          results.push(result)
        } catch (error) {
          console.error('创建题目失败:', error)
          throw error
        }
      }
      return results
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast({
        title: '成功',
        description: `成功保存 ${results.length} 道题目`,
      })
    },
    onError: (error: any) => {
      toast({
        title: '保存失败',
        description: error.message || '保存题目失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 处理AI生成的题目
  const handleAiQuestionsGenerated = async (questions: Question[]) => {
    if (questions.length === 0) {
      return
    }
    await batchCreateMutation.mutateAsync(questions)
  }

  // 处理导入的题目
  const handleImportQuestions = async (importedQuestions: Partial<Question>[]) => {
    if (importedQuestions.length === 0) {
      return
    }
    await batchCreateMutation.mutateAsync(importedQuestions as Question[])
    setIsImportExportDialogOpen(false)
  }

  const questions = data || []

  // 客户端筛选
  const filteredQuestions = useMemo(() => {
    return questions.filter((question: Question) => {
      const matchesSearch = !searchTerm || 
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty
      return matchesSearch && matchesDifficulty
    })
  }, [questions, searchTerm, selectedDifficulty])

  // 使用 useCallback 优化事件处理器
  const handleAdd = useCallback(() => {
    setEditingQuestion(null)
    setIsFormDialogOpen(true)
  }, [])

  const handleEdit = useCallback((question: Question) => {
    setEditingQuestion(question)
    setIsFormDialogOpen(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeletingQuestionId(id)
    setIsConfirmDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deletingQuestionId) {
      deleteMutation.mutate(deletingQuestionId)
      setDeletingQuestionId(null)
    }
  }, [deletingQuestionId, deleteMutation])

  const handleView = useCallback((question: Question) => {
    setViewingQuestion(question)
    setIsDetailDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(async (questionData: any) => {
    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({ id: editingQuestion.id, data: questionData })
      } else {
        await createMutation.mutateAsync(questionData)
      }
    } catch {
      // 错误已经在 mutation 的 onError 中处理
    }
  }, [editingQuestion, updateMutation, createMutation])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">题库管理</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            管理您的题目库，创建、编辑和组织题目
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportExportDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <FileUp className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">导入导出</span>
            <span className="xs:hidden">导入</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAiDialogOpen(true)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">AI 出题</span>
            <span className="xs:hidden">AI</span>
          </Button>
          <Button onClick={handleAdd} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">添加题目</span>
            <span className="xs:hidden">添加</span>
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索题目内容或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">所有难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                更多筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 加载状态 */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500">加载中...</p>
          </CardContent>
        </Card>
      )}

      {/* 错误状态 */}
      {error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">加载失败，请刷新重试</p>
          </CardContent>
        </Card>
      )}

      {/* 题目列表 */}
      {!isLoading && !error && (
        <>
          <div className="space-y-3 sm:space-y-4">
            {filteredQuestions.map((question: Question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">
                  {searchTerm || selectedDifficulty !== 'all' 
                    ? '没有找到匹配的题目' 
                    : '还没有题目，开始创建您的第一道题目吧'}
                </p>
                <Button className="mt-4" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加题目
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 题目表单对话框 */}
      {isFormDialogOpen && <QuestionFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        question={editingQuestion}
        onSubmit={handleSubmit}
      />}

      {/* 题目详情对话框 */}
      {isDetailDialogOpen && <QuestionDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        question={viewingQuestion}
      />}

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="确认删除"
        description="确定要删除这道题目吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />

      {/* AI 出题对话框 */}
      <AiGenerateDialog
        open={isAiDialogOpen}
        onOpenChange={setIsAiDialogOpen}
        onQuestionsGenerated={handleAiQuestionsGenerated}
        userPlan={user?.plan}
      />

      {/* 导入导出对话框 */}
      <ImportExportDialog
        open={isImportExportDialogOpen}
        onOpenChange={setIsImportExportDialogOpen}
        questions={questions}
        onImport={handleImportQuestions}
      />
    </div>
  )
}
