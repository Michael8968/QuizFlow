import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizCode: string
  paperTitle?: string
}

export function QRCodeDialog({
  open,
  onOpenChange,
  quizCode,
  paperTitle,
}: QRCodeDialogProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  // 获取 H5 答卷页面的 URL
  const getQuizUrl = () => {
    // 如果环境变量中有 H5 答卷的 URL，使用它
    const h5Url = import.meta.env.VITE_H5_QUIZ_URL || window.location.origin.replace('web', 'h5-quiz')
    return `${h5Url}?code=${quizCode}`
  }

  const quizUrl = getQuizUrl()

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // 获取 SVG 元素
      const svgElement = qrCodeRef.current?.querySelector('svg')
      if (!svgElement) {
        throw new Error('找不到二维码元素')
      }

      // 将 SVG 转换为 Canvas
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        if (!ctx) {
          setIsDownloading(false)
          toast({
            title: '下载失败',
            description: '无法创建画布上下文',
            variant: 'destructive',
          })
          return
        }

        canvas.width = img.width
        canvas.height = img.height + 60 // 为文字留出空间
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        // 添加文字
        ctx.fillStyle = 'black'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(quizCode, canvas.width / 2, canvas.height - 30)

        // 下载图片
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `quiz-code-${quizCode}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
          setIsDownloading(false)
        })
      }

      img.onerror = () => {
        setIsDownloading(false)
        toast({
          title: '下载失败',
          description: '生成二维码图片失败，请重试',
          variant: 'destructive',
        })
      }

      img.src = url
    } catch (error) {
      setIsDownloading(false)
      toast({
        title: '下载失败',
        description: error instanceof Error ? error.message : '下载二维码失败',
        variant: 'destructive',
      })
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode)
    toast({
      title: '已复制',
      description: `考试码 ${quizCode} 已复制到剪贴板`,
    })
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(quizUrl)
    toast({
      title: '已复制',
      description: '考试链接已复制到剪贴板',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>考试二维码</DialogTitle>
          <DialogDescription>
            {paperTitle ? `试卷：${paperTitle}` : '扫描二维码或输入考试码进入考试'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 二维码 */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <div className="text-center" ref={qrCodeRef}>
              <QRCodeSVG
                value={quizCode}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p className="mt-2 text-sm font-mono font-semibold text-gray-700">
                {quizCode}
              </p>
            </div>
          </div>

          {/* 考试码信息 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">考试码：</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-primary">{quizCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">考试链接：</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={handleCopyUrl}
              >
                <Copy className="h-3 w-3 mr-1" />
                复制
              </Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? '生成中...' : '下载二维码'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

