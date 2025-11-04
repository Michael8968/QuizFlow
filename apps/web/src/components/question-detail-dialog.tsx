import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Question } from '@/types'
import { getQuestionTypeLabel, getDifficultyColor, formatDate } from '@/lib/utils'

interface QuestionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question | null
}

export function QuestionDetailDialog({
  open,
  onOpenChange,
  question,
}: QuestionDetailDialogProps) {
  if (!question) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>题目详情</DialogTitle>
          <DialogDescription>查看题目的完整信息</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              {getQuestionTypeLabel(question.type)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty === 'easy' ? '简单' : 
               question.difficulty === 'medium' ? '中等' : '困难'}
            </span>
            <span className="text-sm text-gray-500">
              {question.points} 分
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">题目内容</h3>
            <p className="text-gray-900">{question.content}</p>
          </div>

          {question.options && question.options.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">选项</h3>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">正确答案</h3>
            <p className="text-gray-900 font-medium">
              {Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}
            </p>
          </div>

          {question.explanation && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">答案解析</h3>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            创建时间: {formatDate(question.created_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

