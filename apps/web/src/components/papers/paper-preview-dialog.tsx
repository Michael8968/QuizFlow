import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Paper, Question } from '@/types'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { getQuestionTypeLabel, getDifficultyColor } from '@/lib/utils'

interface PaperPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paper: Paper | null
}

export function PaperPreviewDialog({
  open,
  onOpenChange,
  paper,
}: PaperPreviewDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // 如果 paper 有 ID，从 API 获取最新数据
  const { data: paperData, isLoading } = useQuery<Paper | null>({
    queryKey: ['paper', paper?.id],
    queryFn: async (): Promise<Paper | null> => {
      if (!paper?.id) return null
      return api.getPaper(paper.id) as Promise<Paper>
    },
    enabled: open && !!paper?.id,
  })

  const displayPaper = paperData || paper

  useEffect(() => {
    if (open) {
      setCurrentQuestionIndex(0)
    }
  }, [open])

  if (!displayPaper) {
    return null
  }

  const questions = displayPaper.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>预览试卷：{displayPaper.title}</DialogTitle>
          <DialogDescription>
            {displayPaper.description || '试卷预览'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 试卷信息 */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{displayPaper.title}</h3>
                  {displayPaper.description && (
                    <p className="text-sm text-gray-600 mt-1">{displayPaper.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  共 {questions.length} 题
                  {displayPaper.settings?.time_limit && (
                    <span className="ml-2">· 限时 {displayPaper.settings.time_limit} 分钟</span>
                  )}
                </div>
              </div>
              
              {/* 进度条 */}
              {questions.length > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    第 {currentQuestionIndex + 1} 题，共 {questions.length} 题
                  </p>
                </div>
              )}
            </div>

            {/* 题目列表 */}
            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                此试卷暂无题目
              </div>
            ) : (
              <div className="space-y-6">
                {currentQuestion && (
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-gray-500">
                        {getQuestionTypeLabel(currentQuestion.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                        {currentQuestion.difficulty === 'easy' ? '简单' : 
                         currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {currentQuestion.points} 分
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium mb-4">{currentQuestion.content}</h4>
                    
                    {currentQuestion.options && currentQuestion.options.length > 0 ? (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 border border-gray-200 rounded-md"
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                        <span className="text-gray-500">填空题或问答题</span>
                      </div>
                    )}

                    {currentQuestion.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-900 mb-1">答案解析：</p>
                        <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-900 mb-1">正确答案：</p>
                      <p className="text-sm text-green-800">
                        {Array.isArray(currentQuestion.answer) 
                          ? currentQuestion.answer.join(', ') 
                          : currentQuestion.answer}
                      </p>
                    </div>
                  </div>
                )}

                {/* 导航按钮 */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(currentQuestionIndex - 1)
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                  >
                    上一题
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1)
                      }
                    }}
                    disabled={currentQuestionIndex >= questions.length - 1}
                  >
                    下一题
                  </Button>
                </div>

                {/* 题目索引 */}
                {questions.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {questions.map((_: Question, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 rounded-md border text-sm font-medium transition-colors ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

