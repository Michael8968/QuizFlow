import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Paper, Question } from '@/types'
import * as XLSX from 'xlsx'

interface PaperExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paper: Paper
}

export function PaperExportDialog({
  open,
  onOpenChange,
  paper,
}: PaperExportDialogProps) {
  const [includeAnswers, setIncludeAnswers] = useState(false)
  const [includeExplanations, setIncludeExplanations] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single':
        return '单选题'
      case 'multiple':
        return '多选题'
      case 'fill':
        return '填空题'
      case 'essay':
        return '问答题'
      default:
        return type
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单'
      case 'medium':
        return '中等'
      case 'hard':
        return '困难'
      default:
        return difficulty
    }
  }

  const formatAnswer = (question: Question) => {
    if (question.type === 'single' || question.type === 'multiple') {
      // 选择题显示选项字母
      if (Array.isArray(question.answer)) {
        return question.answer.map(a => String.fromCharCode(65 + parseInt(a))).join(', ')
      }
      const index = parseInt(question.answer as string)
      return isNaN(index) ? question.answer : String.fromCharCode(65 + index)
    }
    return question.answer
  }

  const exportToWord = async () => {
    setIsExporting(true)
    try {
      const questions = paper.questions || []

      // 生成 HTML 内容
      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${paper.title}</title>
<style>
body { font-family: 'SimSun', serif; margin: 40px; line-height: 1.6; }
h1 { text-align: center; font-size: 24px; margin-bottom: 10px; }
.description { text-align: center; color: #666; margin-bottom: 30px; }
.info { text-align: center; color: #999; font-size: 12px; margin-bottom: 20px; }
.question { margin-bottom: 25px; page-break-inside: avoid; }
.question-header { font-weight: bold; margin-bottom: 8px; }
.question-type { color: #666; font-size: 12px; margin-left: 10px; }
.question-points { color: #999; font-size: 12px; margin-left: 10px; }
.question-content { margin-bottom: 10px; }
.options { margin-left: 20px; }
.option { margin-bottom: 5px; }
.answer-section { margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
.answer-label { font-weight: bold; color: #333; }
.explanation { margin-top: 10px; color: #666; font-style: italic; }
.divider { border-top: 1px dashed #ccc; margin: 30px 0; }
</style>
</head>
<body>
<h1>${paper.title}</h1>
${paper.description ? `<p class="description">${paper.description}</p>` : ''}
<p class="info">共 ${questions.length} 题 | 总分 ${questions.reduce((sum, q) => sum + (q.points || 0), 0)} 分${paper.settings?.time_limit ? ` | 时限 ${paper.settings.time_limit} 分钟` : ''}</p>
<div class="divider"></div>
`

      questions.forEach((question, index) => {
        htmlContent += `
<div class="question">
  <div class="question-header">
    ${index + 1}.
    <span class="question-type">[${getQuestionTypeLabel(question.type)}]</span>
    <span class="question-points">(${question.points || 0}分)</span>
  </div>
  <div class="question-content">${question.content}</div>
`

        // 选项
        if (question.options && question.options.length > 0) {
          htmlContent += `<div class="options">`
          question.options.forEach((option, optIndex) => {
            htmlContent += `<div class="option">${String.fromCharCode(65 + optIndex)}. ${option}</div>`
          })
          htmlContent += `</div>`
        }

        // 答案和解析
        if (includeAnswers || includeExplanations) {
          htmlContent += `<div class="answer-section">`
          if (includeAnswers) {
            htmlContent += `<div><span class="answer-label">答案：</span>${formatAnswer(question)}</div>`
          }
          if (includeExplanations && question.explanation) {
            htmlContent += `<div class="explanation"><span class="answer-label">解析：</span>${question.explanation}</div>`
          }
          htmlContent += `</div>`
        }

        htmlContent += `</div>`
      })

      htmlContent += `
</body>
</html>
`

      // 创建 Blob 并下载
      const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${paper.title}${includeAnswers ? '（含答案）' : ''}.doc`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const questions = paper.questions || []

      // 准备 Excel 数据
      const headers = ['题号', '题型', '难度', '分值', '题目内容', '选项A', '选项B', '选项C', '选项D', '选项E', '选项F']
      if (includeAnswers) {
        headers.push('答案')
      }
      if (includeExplanations) {
        headers.push('解析')
      }

      const data = questions.map((question, index) => {
        const row: any[] = [
          index + 1,
          getQuestionTypeLabel(question.type),
          getDifficultyLabel(question.difficulty),
          question.points || 0,
          question.content,
        ]

        // 添加选项（最多6个）
        for (let i = 0; i < 6; i++) {
          row.push(question.options?.[i] || '')
        }

        if (includeAnswers) {
          row.push(formatAnswer(question))
        }
        if (includeExplanations) {
          row.push(question.explanation || '')
        }

        return row
      })

      // 创建工作簿
      const wb = XLSX.utils.book_new()

      // 试卷信息表
      const infoData = [
        ['试卷标题', paper.title],
        ['试卷描述', paper.description || ''],
        ['题目数量', questions.length],
        ['总分', questions.reduce((sum, q) => sum + (q.points || 0), 0)],
        ['时间限制', paper.settings?.time_limit ? `${paper.settings.time_limit}分钟` : '无限制'],
        ['创建时间', new Date(paper.created_at).toLocaleString('zh-CN')],
      ]
      const infoWs = XLSX.utils.aoa_to_sheet(infoData)
      infoWs['!cols'] = [{ wch: 12 }, { wch: 50 }]
      XLSX.utils.book_append_sheet(wb, infoWs, '试卷信息')

      // 题目表
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
      ws['!cols'] = [
        { wch: 6 },   // 题号
        { wch: 8 },   // 题型
        { wch: 8 },   // 难度
        { wch: 6 },   // 分值
        { wch: 50 },  // 题目内容
        { wch: 20 },  // 选项A
        { wch: 20 },  // 选项B
        { wch: 20 },  // 选项C
        { wch: 20 },  // 选项D
        { wch: 20 },  // 选项E
        { wch: 20 },  // 选项F
        ...(includeAnswers ? [{ wch: 15 }] : []),
        ...(includeExplanations ? [{ wch: 40 }] : []),
      ]
      XLSX.utils.book_append_sheet(wb, ws, '题目列表')

      // 下载
      XLSX.writeFile(wb, `${paper.title}${includeAnswers ? '（含答案）' : ''}.xlsx`)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToText = async () => {
    setIsExporting(true)
    try {
      const questions = paper.questions || []

      let textContent = `${paper.title}\n`
      textContent += '='.repeat(50) + '\n\n'

      if (paper.description) {
        textContent += `${paper.description}\n\n`
      }

      textContent += `共 ${questions.length} 题 | 总分 ${questions.reduce((sum, q) => sum + (q.points || 0), 0)} 分`
      if (paper.settings?.time_limit) {
        textContent += ` | 时限 ${paper.settings.time_limit} 分钟`
      }
      textContent += '\n\n' + '-'.repeat(50) + '\n\n'

      questions.forEach((question, index) => {
        textContent += `${index + 1}. [${getQuestionTypeLabel(question.type)}] (${question.points || 0}分)\n`
        textContent += `${question.content}\n`

        if (question.options && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            textContent += `   ${String.fromCharCode(65 + optIndex)}. ${option}\n`
          })
        }

        if (includeAnswers) {
          textContent += `\n   答案：${formatAnswer(question)}\n`
        }
        if (includeExplanations && question.explanation) {
          textContent += `   解析：${question.explanation}\n`
        }

        textContent += '\n'
      })

      // 创建 Blob 并下载
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${paper.title}${includeAnswers ? '（含答案）' : ''}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>导出试卷</DialogTitle>
          <DialogDescription>
            选择导出格式和选项，将试卷导出为文档
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 试卷信息 */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm">{paper.title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              {paper.questions?.length || 0} 道题目 · 总分 {paper.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0} 分
            </p>
          </div>

          {/* 导出选项 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">导出选项</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeAnswers}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setIncludeAnswers(checked === true)}
                />
                <span className="text-sm">包含答案</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeExplanations}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setIncludeExplanations(checked === true)}
                />
                <span className="text-sm">包含解析</span>
              </label>
            </div>
          </div>

          {/* 导出格式 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">选择格式</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                onClick={exportToWord}
                disabled={isExporting}
                className="justify-start h-12"
              >
                {isExporting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="mr-3 h-5 w-5 text-blue-600" />
                )}
                <div className="text-left">
                  <div className="font-medium">Word 文档</div>
                  <div className="text-xs text-gray-500">适合打印和编辑</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={exportToExcel}
                disabled={isExporting}
                className="justify-start h-12"
              >
                {isExporting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Download className="mr-3 h-5 w-5 text-green-600" />
                )}
                <div className="text-left">
                  <div className="font-medium">Excel 表格</div>
                  <div className="text-xs text-gray-500">适合数据分析和管理</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={exportToText}
                disabled={isExporting}
                className="justify-start h-12"
              >
                {isExporting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="mr-3 h-5 w-5 text-gray-600" />
                )}
                <div className="text-left">
                  <div className="font-medium">纯文本</div>
                  <div className="text-xs text-gray-500">通用格式，兼容性好</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
