import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Upload, FileSpreadsheet, FileText, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { Question } from '@/types'
import { useToast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  onImport: (questions: Partial<Question>[]) => Promise<void>
}

interface ImportPreview {
  valid: Partial<Question>[]
  invalid: { row: number; reason: string; data: any }[]
}

const TYPE_MAP: Record<string, string> = {
  '单选题': 'single',
  '多选题': 'multiple',
  '填空题': 'fill',
  '问答题': 'essay',
  'single': 'single',
  'multiple': 'multiple',
  'fill': 'fill',
  'essay': 'essay',
}

const DIFFICULTY_MAP: Record<string, string> = {
  '简单': 'easy',
  '中等': 'medium',
  '困难': 'hard',
  'easy': 'easy',
  'medium': 'medium',
  'hard': 'hard',
}

export function ImportExportDialog({
  open,
  onOpenChange,
  questions,
  onImport,
}: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState('export')
  const [importing, setImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 导出题目为 Excel
  const handleExportExcel = () => {
    if (questions.length === 0) {
      toast({
        title: '导出失败',
        description: '没有可导出的题目',
        variant: 'destructive',
      })
      return
    }

    const data = questions.map((q) => {
      const options = q.options || []
      return {
        '题目类型': q.type === 'single' ? '单选题' :
                   q.type === 'multiple' ? '多选题' :
                   q.type === 'fill' ? '填空题' : '问答题',
        '题目内容': q.content,
        '选项A': options[0] || '',
        '选项B': options[1] || '',
        '选项C': options[2] || '',
        '选项D': options[3] || '',
        '正确答案': Array.isArray(q.answer) ? q.answer.join(',') : q.answer,
        '解析': q.explanation || '',
        '难度': q.difficulty === 'easy' ? '简单' :
               q.difficulty === 'medium' ? '中等' : '困难',
        '分值': q.points,
        '标签': q.tags?.join(',') || '',
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '题目')

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 10 }, // 题目类型
      { wch: 50 }, // 题目内容
      { wch: 20 }, // 选项A
      { wch: 20 }, // 选项B
      { wch: 20 }, // 选项C
      { wch: 20 }, // 选项D
      { wch: 15 }, // 正确答案
      { wch: 30 }, // 解析
      { wch: 10 }, // 难度
      { wch: 8 },  // 分值
      { wch: 20 }, // 标签
    ]

    const fileName = `题库导出_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)

    toast({
      title: '导出成功',
      description: `已导出 ${questions.length} 道题目`,
    })
  }

  // 导出为 CSV
  const handleExportCSV = () => {
    if (questions.length === 0) {
      toast({
        title: '导出失败',
        description: '没有可导出的题目',
        variant: 'destructive',
      })
      return
    }

    const data = questions.map((q) => {
      const options = q.options || []
      return {
        '题目类型': q.type === 'single' ? '单选题' :
                   q.type === 'multiple' ? '多选题' :
                   q.type === 'fill' ? '填空题' : '问答题',
        '题目内容': q.content,
        '选项A': options[0] || '',
        '选项B': options[1] || '',
        '选项C': options[2] || '',
        '选项D': options[3] || '',
        '正确答案': Array.isArray(q.answer) ? q.answer.join(',') : q.answer,
        '解析': q.explanation || '',
        '难度': q.difficulty === 'easy' ? '简单' :
               q.difficulty === 'medium' ? '中等' : '困难',
        '分值': q.points,
        '标签': q.tags?.join(',') || '',
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    // 添加 BOM 以支持中文
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `题库导出_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: '导出成功',
      description: `已导出 ${questions.length} 道题目`,
    })
  }

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '题目类型': '单选题',
        '题目内容': '以下哪个是 JavaScript 的基本数据类型？',
        '选项A': 'Object',
        '选项B': 'Array',
        '选项C': 'String',
        '选项D': 'Function',
        '正确答案': 'C',
        '解析': 'String 是 JavaScript 的基本数据类型之一',
        '难度': '简单',
        '分值': 5,
        '标签': 'JavaScript,基础',
      },
      {
        '题目类型': '多选题',
        '题目内容': '以下哪些是 React 的生命周期方法？',
        '选项A': 'componentDidMount',
        '选项B': 'render',
        '选项C': 'useState',
        '选项D': 'componentWillUnmount',
        '正确答案': 'A,B,D',
        '解析': 'useState 是 Hook，不是生命周期方法',
        '难度': '中等',
        '分值': 10,
        '标签': 'React,生命周期',
      },
      {
        '题目类型': '填空题',
        '题目内容': 'CSS 中用于设置元素宽度的属性是 ___',
        '选项A': '',
        '选项B': '',
        '选项C': '',
        '选项D': '',
        '正确答案': 'width',
        '解析': 'width 属性用于设置元素的宽度',
        '难度': '简单',
        '分值': 5,
        '标签': 'CSS,基础',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板')

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 50 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 8 },
      { wch: 20 },
    ]

    XLSX.writeFile(workbook, '题目导入模板.xlsx')

    toast({
      title: '下载成功',
      description: '模板已下载，请按照格式填写题目',
    })
  }

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportPreview(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

      const valid: Partial<Question>[] = []
      const invalid: { row: number; reason: string; data: any }[] = []

      jsonData.forEach((row, index) => {
        const rowNum = index + 2 // Excel 行号从 2 开始（第 1 行是表头）

        // 验证必填字段
        if (!row['题目内容'] && !row['content']) {
          invalid.push({ row: rowNum, reason: '题目内容不能为空', data: row })
          return
        }

        const typeValue = row['题目类型'] || row['type'] || 'single'
        const type = TYPE_MAP[typeValue]
        if (!type) {
          invalid.push({ row: rowNum, reason: `无效的题目类型: ${typeValue}`, data: row })
          return
        }

        const difficultyValue = row['难度'] || row['difficulty'] || 'medium'
        const difficulty = DIFFICULTY_MAP[difficultyValue]
        if (!difficulty) {
          invalid.push({ row: rowNum, reason: `无效的难度: ${difficultyValue}`, data: row })
          return
        }

        // 构建选项数组
        const options: string[] = []
        const optionA = row['选项A'] || row['optionA'] || ''
        const optionB = row['选项B'] || row['optionB'] || ''
        const optionC = row['选项C'] || row['optionC'] || ''
        const optionD = row['选项D'] || row['optionD'] || ''

        if (optionA) options.push(String(optionA))
        if (optionB) options.push(String(optionB))
        if (optionC) options.push(String(optionC))
        if (optionD) options.push(String(optionD))

        // 处理答案
        let answer: string | string[] = row['正确答案'] || row['answer'] || ''
        if (type === 'multiple' && typeof answer === 'string') {
          answer = answer.split(',').map((a: string) => a.trim())
        }

        // 处理标签
        const tagsValue = row['标签'] || row['tags'] || ''
        const tags = typeof tagsValue === 'string'
          ? tagsValue.split(',').map((t: string) => t.trim()).filter(Boolean)
          : []

        // 处理分值
        const points = parseInt(row['分值'] || row['points'] || '5', 10) || 5

        valid.push({
          type: type as Question['type'],
          content: String(row['题目内容'] || row['content']),
          options: options.length > 0 ? options : undefined,
          answer: String(answer),
          explanation: row['解析'] || row['explanation'] || '',
          difficulty: difficulty as Question['difficulty'],
          points,
          tags,
        })
      })

      setImportPreview({ valid, invalid })
    } catch (error) {
      console.error('解析文件失败:', error)
      toast({
        title: '解析失败',
        description: '无法解析文件，请确保文件格式正确',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 确认导入
  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.valid.length === 0) return

    setImporting(true)
    try {
      await onImport(importPreview.valid)
      toast({
        title: '导入成功',
        description: `成功导入 ${importPreview.valid.length} 道题目`,
      })
      setImportPreview(null)
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: '导入失败',
        description: error.message || '导入过程中发生错误',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导入/导出题目</DialogTitle>
          <DialogDescription>
            批量导入或导出您的题库数据
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              导出
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              导入
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportExcel}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    导出为 Excel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    导出为 .xlsx 格式，支持在 Excel 中编辑
                  </CardDescription>
                  <p className="text-sm text-gray-600 mt-2">
                    当前题库: {questions.length} 道题目
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportCSV}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-blue-600" />
                    导出为 CSV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    导出为 .csv 格式，通用性更强
                  </CardDescription>
                  <p className="text-sm text-gray-600 mt-2">
                    当前题库: {questions.length} 道题目
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            {!importPreview ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">上传文件</CardTitle>
                    <CardDescription>
                      支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {importing ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-gray-500">正在解析文件...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            点击或拖拽文件到此处上传
                          </p>
                          <p className="text-xs text-gray-400">
                            支持 .xlsx, .xls, .csv 格式
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">下载模板</CardTitle>
                    <CardDescription>
                      按照模板格式填写题目，确保导入成功
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={handleDownloadTemplate}>
                      <Download className="mr-2 h-4 w-4" />
                      下载导入模板
                    </Button>
                  </CardContent>
                </Card>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">导入说明</p>
                      <ul className="list-disc list-inside space-y-1 text-amber-700">
                        <li>题目类型支持: 单选题、多选题、填空题、问答题</li>
                        <li>多选题答案用逗号分隔，如: A,B,C</li>
                        <li>难度支持: 简单、中等、困难</li>
                        <li>标签用逗号分隔，如: JavaScript,基础</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">导入预览</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportPreview(null)}
                  >
                    重新选择
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          可导入: {importPreview.valid.length} 道
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={importPreview.invalid.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <XCircle className={`h-5 w-5 ${importPreview.invalid.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${importPreview.invalid.length > 0 ? 'text-red-800' : 'text-gray-500'}`}>
                          无效: {importPreview.invalid.length} 道
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {importPreview.invalid.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-red-800">无效题目详情</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {importPreview.invalid.map((item, index) => (
                          <div key={index} className="text-sm text-red-700">
                            第 {item.row} 行: {item.reason}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {importPreview.valid.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">题目预览 (前5道)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {importPreview.valid.slice(0, 5).map((q, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {q.type === 'single' ? '单选' :
                                 q.type === 'multiple' ? '多选' :
                                 q.type === 'fill' ? '填空' : '问答'}
                              </span>
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {q.difficulty === 'easy' ? '简单' :
                                 q.difficulty === 'medium' ? '中等' : '困难'}
                              </span>
                            </div>
                            <p className="text-gray-700 line-clamp-2">{q.content}</p>
                          </div>
                        ))}
                        {importPreview.valid.length > 5 && (
                          <p className="text-center text-sm text-gray-500">
                            还有 {importPreview.valid.length - 5} 道题目...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setImportPreview(null)}>
                    取消
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={importing || importPreview.valid.length === 0}
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        导入中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        确认导入 ({importPreview.valid.length} 道)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
