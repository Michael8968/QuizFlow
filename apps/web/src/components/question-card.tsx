import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye } from 'lucide-react'
import { getQuestionTypeLabel, getDifficultyColor } from '@/lib/utils'
import { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  onView: (question: Question) => void
  onEdit: (question: Question) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

/**
 * 题目卡片组件 - 使用 memo 优化重复渲染
 */
export const QuestionCard = memo(function QuestionCard({
  question,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: QuestionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:pt-6 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                {getQuestionTypeLabel(question.type)}
              </span>
              <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty === 'easy' ? '简单' :
                 question.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {question.points} 分
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-900 mb-3 line-clamp-3 sm:line-clamp-none">{question.content}</p>
            {question.options && question.options.length > 0 && (
              <div className="space-y-1 mb-3">
                {question.options.slice(0, 2).map((option: string, index: number) => (
                  <div key={index} className="text-xs sm:text-sm text-gray-600 truncate">
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
                {question.options.length > 2 && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    还有 {question.options.length - 2} 个选项...
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {question.tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {question.tags && question.tags.length > 3 && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{question.tags.length - 3}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 sm:ml-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(question)}
              title="查看详情"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(question)}
              title="编辑"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700"
              onClick={() => onDelete(question.id)}
              title="删除"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
