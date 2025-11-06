import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, Copy, BarChart3, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { api } from '@/lib/api'
import { Paper, Question } from '@/types'
import { PaperFormDialog } from '@/components/papers/paper-form-dialog'
import { PaperPreviewDialog } from '@/components/papers/paper-preview-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToast } from '@/hooks/use-toast'

// 扩展 Paper 类型以包含统计数据
interface PaperWithStats extends Paper {
  answerCount?: number
  averageScore?: number
}

export function Papers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null)
  const [previewingPaper, setPreviewingPaper] = useState<Paper | null>(null)
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 获取试卷列表
  const { data, isLoading, error } = useQuery<PaperWithStats[]>({
    queryKey: ['papers'],
    queryFn: async () => {
      const response = await api.getPapers() as PaperWithStats[]
      return response || []
    },
  })

  // 创建试卷
  const createMutation = useMutation({
    mutationFn: async (paperData: any) => {
      return api.createPaper(paperData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      toast({
        title: '成功',
        description: '试卷创建成功',
      })
      setIsFormDialogOpen(false)
      setEditingPaper(null)
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.message || '创建试卷失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 更新试卷
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.updatePaper(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      toast({
        title: '成功',
        description: '试卷更新成功',
      })
      setIsFormDialogOpen(false)
      setEditingPaper(null)
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error.message || '更新试卷失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 删除试卷
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.deletePaper(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      toast({
        title: '成功',
        description: '试卷删除成功',
      })
      setDeletingPaperId(null)
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.message || '删除试卷失败，请重试',
        variant: 'destructive',
      })
    },
  })

  // 复制试卷
  const copyMutation = useMutation({
    mutationFn: async (paper: Paper) => {
      // 创建新试卷，复制所有数据但修改标题
      const newPaperData = {
        title: `${paper.title} (副本)`,
        description: paper.description,
        questions: paper.questions || [],
        status: 'draft' as const,
        settings: paper.settings,
      }
      
      return api.createPaper(newPaperData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      toast({
        title: '成功',
        description: '试卷复制成功',
      })
    },
    onError: (error: any) => {
      toast({
        title: '复制失败',
        description: error.message || '复制试卷失败，请重试',
        variant: 'destructive',
      })
    },
  })

  const papers = data || []

  // 客户端筛选
  const filteredPapers = useMemo(() => {
    return papers.filter((paper: PaperWithStats) => {
      const matchesSearch = !searchTerm || 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paper.description && paper.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })
  }, [papers, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
      case 'archived':
        return '已归档'
      default:
        return '未知'
    }
  }

  const handleAdd = () => {
    setEditingPaper(null)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper)
    setIsFormDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingPaperId(id)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deletingPaperId) {
      await deleteMutation.mutateAsync(deletingPaperId)
      setIsConfirmDialogOpen(false)
    }
  }

  const handleCopy = (paper: Paper) => {
    copyMutation.mutate(paper)
  }

  const handlePreview = (paper: Paper) => {
    setPreviewingPaper(paper)
  }

  const handleViewReport = (paperId: string) => {
    // 导航到报告页面
    navigate(`/reports?paperId=${paperId}`)
  }

  const handleSubmit = async (paperData: any) => {
    try {
      // 获取完整的题目对象
      const questionsResponse = await api.getQuestions({ limit: 1000 }) as { data?: Question[]; count?: number }
      const allQuestions = questionsResponse.data || []
      
      // 根据 question_ids 获取完整的题目对象
      const selectedQuestions = allQuestions.filter(q => paperData.question_ids.includes(q.id))
      
      // 构建试卷数据
      const paperPayload = {
        title: paperData.title,
        description: paperData.description,
        status: paperData.status,
        questions: selectedQuestions,
        settings: {
          time_limit: paperData.time_limit || null,
          shuffle_questions: paperData.shuffle_questions,
          shuffle_options: paperData.shuffle_options,
          show_correct_answer: paperData.show_correct_answer,
          allow_review: paperData.allow_review,
        },
      }
      
      if (editingPaper) {
        await updateMutation.mutateAsync({ id: editingPaper.id, data: paperPayload })
      } else {
        await createMutation.mutateAsync(paperPayload)
      }
    } catch (error) {
      // 错误已经在 mutation 的 onError 中处理
      console.error('提交试卷失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">试卷管理</h1>
          <p className="mt-2 text-gray-600">
            创建和管理您的试卷，设置考试参数
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          创建试卷
        </Button>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索试卷标题或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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

      {/* 试卷列表 */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{paper.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {paper.description || '暂无描述'}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                      {getStatusText(paper.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>题目数量</span>
                      <span>{paper.questions?.length || 0} 题</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>时间限制</span>
                      <span>
                        {paper.settings?.time_limit ? `${paper.settings.time_limit} 分钟` : '无限制'}
                      </span>
                    </div>
                    {paper.answerCount !== undefined && (
                      <>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>答卷数量</span>
                          <span>{paper.answerCount} 份</span>
                        </div>
                        {paper.answerCount > 0 && paper.averageScore !== undefined && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>平均分</span>
                            <span>{paper.averageScore.toFixed(1)}%</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>创建时间</span>
                      <span>{formatDate(paper.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(paper)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      预览
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(paper)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopy(paper)}
                      disabled={copyMutation.isPending}
                      title="复制试卷"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(paper.id)}
                      disabled={deleteMutation.isPending}
                      title="删除试卷"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {paper.answerCount !== undefined && paper.answerCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleViewReport(paper.id)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      查看分析报告
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPapers.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">
                  {searchTerm ? '没有找到匹配的试卷' : '还没有试卷，开始创建您的第一份试卷吧'}
                </p>
                <Button className="mt-4" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建第一份试卷
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 试卷表单对话框 */}
      {isFormDialogOpen && (
        <PaperFormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          paper={editingPaper}
          onSubmit={handleSubmit}
        />
      )}

      {/* 预览对话框 */}
      {previewingPaper && (
        <PaperPreviewDialog
          open={!!previewingPaper}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewingPaper(null)
            }
          }}
          paper={previewingPaper}
        />
      )}

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="确认删除"
        description="确定要删除这份试卷吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  )
}
