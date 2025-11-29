import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Send, MessageSquare, Bug, Lightbulb, HelpCircle, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FeedbackType = 'bug' | 'feature' | 'question' | 'other'

const feedbackTypes = [
  { value: 'bug' as FeedbackType, label: '问题反馈', icon: Bug, color: 'text-red-500' },
  { value: 'feature' as FeedbackType, label: '功能建议', icon: Lightbulb, color: 'text-yellow-500' },
  { value: 'question' as FeedbackType, label: '使用疑问', icon: HelpCircle, color: 'text-blue-500' },
  { value: 'other' as FeedbackType, label: '其他反馈', icon: MessageSquare, color: 'text-gray-500' },
]

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [type, setType] = useState<FeedbackType>('feature')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuthStore()

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: '请填写完整',
        description: '标题和内容不能为空',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await api.submitFeedback({
        type,
        title: title.trim(),
        content: content.trim(),
        rating: rating || undefined,
        user_email: user?.email,
        user_name: user?.name,
      })

      toast({
        title: '提交成功',
        description: '感谢您的反馈，我们会认真阅读并改进产品',
      })

      // 重置表单
      setType('feature')
      setTitle('')
      setContent('')
      setRating(0)
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: '提交失败',
        description: error.message || '提交反馈失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>反馈与建议</DialogTitle>
          <DialogDescription>
            我们非常重视您的意见，请告诉我们您的想法
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 反馈类型 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">反馈类型</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((item) => {
                const Icon = item.icon
                const isSelected = type === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-title" className="text-sm font-medium">
              标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="feedback-title"
              placeholder="简要描述您的反馈..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 text-right">{title.length}/100</p>
          </div>

          {/* 详细内容 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-content" className="text-sm font-medium">
              详细描述 <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="feedback-content"
              placeholder="请详细描述您遇到的问题或建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 text-right">{content.length}/2000</p>
          </div>

          {/* 满意度评分 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">产品满意度（可选）</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  {rating === 1 && '需要改进'}
                  {rating === 2 && '一般'}
                  {rating === 3 && '还不错'}
                  {rating === 4 && '很好'}
                  {rating === 5 && '非常满意'}
                </span>
              )}
            </div>
          </div>

          {/* 用户信息提示 */}
          {user && (
            <p className="text-xs text-gray-500">
              反馈将以 {user.email} 的身份提交，我们可能会通过邮件与您联系
            </p>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  提交反馈
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
