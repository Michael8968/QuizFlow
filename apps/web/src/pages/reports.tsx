import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Download, Eye, RefreshCw, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Paper, Answer, Report, Question } from '@/types'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'

// 扩展 Answer 类型以包含 time_spent
interface AnswerWithTime extends Answer {
  time_spent?: number
}

// 检查答案是否正确（移到组件外部，避免重复创建）
function checkAnswerCorrect(question: Question, userAnswer: string | string[]): boolean {
  const correctAnswer = question.answer

  if (question.type === 'single') {
    return String(userAnswer).trim() === String(correctAnswer).trim()
  } else if (question.type === 'multiple') {
    const userArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const correctArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
    if (userArray.length !== correctArray.length) return false
    return userArray.every(ans => correctArray.includes(String(ans).trim()))
  } else if (question.type === 'fill') {
    const userText = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
    const correctText = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer
    return String(userText).trim().toLowerCase() === String(correctText).trim().toLowerCase()
  }

  return false
}

export function Reports() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedPaperId = searchParams.get('paperId') || 'all'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuthStore()

  // 获取试卷列表
  const { data: papersData, isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ['papers', 'reports'],
    queryFn: async () => {
      const response = await api.getPapers() as Paper[]
      return response || []
    },
  })

  // 权限过滤：只显示当前用户的试卷
  const userPapers = useMemo(() => {
    if (!papersData || !user) return []
    return papersData.filter(paper => paper.user_id === user.id)
  }, [papersData, user])

  // 获取所有试卷的答案（只获取当前用户试卷的答案）
  const { data: allAnswers, isLoading: answersLoading } = useQuery<AnswerWithTime[]>({
    queryKey: ['answers', 'reports', userPapers.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!userPapers || userPapers.length === 0) return []
      
      const answersPromises = userPapers.map(paper => 
        api.getAnswers(paper.id)
          .then((response: any) => Array.isArray(response) ? response : [])
          .catch(() => [])
      )
      const answersArrays = await Promise.all(answersPromises)
      return answersArrays.flat() as AnswerWithTime[]
    },
    enabled: !!userPapers && userPapers.length > 0,
  })

  // 获取报告列表
  const { data: reportsData, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await api.getReports() as Report[]
      return response || []
    },
  })

  // 获取题目列表（用于题目分析）
  const { data: questionsData } = useQuery<{ data?: Question[]; count?: number }>({
    queryKey: ['questions', 'reports'],
    queryFn: async () => {
      return await api.getQuestions({ limit: 1000 }) as { data?: Question[]; count?: number }
    },
  })

  // 根据选择的试卷过滤答案（只包含当前用户试卷的答案）
  const filteredAnswers = useMemo(() => {
    if (!allAnswers) return []
    const userPaperIds = userPapers.map(p => p.id)
    const userAnswers = allAnswers.filter(a => userPaperIds.includes(a.paper_id))
    
    if (selectedPaperId === 'all') return userAnswers
    return userAnswers.filter(a => a.paper_id === selectedPaperId)
  }, [allAnswers, selectedPaperId, userPapers])

  // 获取当前选择的试卷（只从当前用户的试卷中选择）
  const selectedPaper = useMemo(() => {
    if (!userPapers || selectedPaperId === 'all') return null
    return userPapers.find(p => p.id === selectedPaperId) || null
  }, [userPapers, selectedPaperId])

  // 计算汇总统计数据
  const summaryStats = useMemo(() => {
    const answers = filteredAnswers || []
    const completedAnswers = answers.filter(a => 
      (a.status === 'completed' || a.status === 'graded') &&
      a.total_score > 0 &&
      a.score >= 0 &&
      isFinite(a.score) &&
      isFinite(a.total_score)
    )

    const totalStudents = new Set(answers.map(a => a.student_email || a.student_name || a.id)).size
    const averageScore = completedAnswers.length > 0
      ? completedAnswers.reduce((sum, a) => {
          const scoreRate = Math.min(100, Math.max(0, (a.score / a.total_score) * 100))
          return sum + scoreRate
        }, 0) / completedAnswers.length
      : 0

    // 及格率（假设60分为及格线）
    const passCount = completedAnswers.filter(a => {
      const scoreRate = (a.score / a.total_score) * 100
      return scoreRate >= 60
    }).length
    const passRate = completedAnswers.length > 0 ? (passCount / completedAnswers.length) * 100 : 0

    // 完成率
    const totalStarted = answers.length
    const completionRate = totalStarted > 0 ? (completedAnswers.length / totalStarted) * 100 : 0

    return {
      totalStudents,
      averageScore: Math.round(averageScore * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
    }
  }, [filteredAnswers])

  // 计算分数分布数据
  const scoreDistributionData = useMemo(() => {
    const answers = filteredAnswers || []
    const completedAnswers = answers.filter(a => 
      (a.status === 'completed' || a.status === 'graded') &&
      a.total_score > 0
    )

    const ranges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 },
    ]

    return ranges.map(range => {
      const count = completedAnswers.filter(a => {
        const scoreRate = (a.score / a.total_score) * 100
        return scoreRate >= range.min && scoreRate <= range.max
      }).length
      return { score: range.label, count }
    })
  }, [filteredAnswers])

  // 计算题目正确率数据
  const questionAnalysisData = useMemo(() => {
    if (!selectedPaper || !allAnswers || !questionsData?.data) return []

    const paperAnswers = allAnswers.filter(a => a.paper_id === selectedPaper.id)
    const completedAnswers = paperAnswers.filter(a => 
      (a.status === 'completed' || a.status === 'graded')
    )

    if (completedAnswers.length === 0) return []

    const questions = selectedPaper.questions || []
    const allQuestions = questionsData.data

    return questions.map((q, index) => {
      const question = allQuestions.find(aq => aq.id === q.id) || q
      let correctCount = 0

      completedAnswers.forEach(answer => {
        const userAnswer = answer.responses[q.id]
        if (userAnswer !== undefined && userAnswer !== null) {
          // 检查答案是否正确
          const isCorrect = checkAnswerCorrect(question, userAnswer)
          if (isCorrect) correctCount++
        }
      })

      const correctRate = completedAnswers.length > 0
        ? Math.round((correctCount / completedAnswers.length) * 100)
        : 0

      return {
        question: `Q${index + 1}`,
        correctRate,
      }
    })
  }, [selectedPaper, allAnswers, questionsData])

  // 计算答题时间分析数据
  const timeAnalysisData = useMemo(() => {
    const answers = filteredAnswers || []
    const completedAnswers = answers.filter(a => 
      (a.status === 'completed' || a.status === 'graded') &&
      a.time_spent !== undefined &&
      a.time_spent > 0
    )

    const ranges = [
      { label: '0-10min', max: 10 * 60 },
      { label: '10-20min', max: 20 * 60 },
      { label: '20-30min', max: 30 * 60 },
      { label: '30-40min', max: 40 * 60 },
      { label: '40-50min', max: 50 * 60 },
      { label: '50-60min', max: 60 * 60 },
    ]

    return ranges.map((range, index) => {
      const min = index === 0 ? 0 : ranges[index - 1].max
      const count = completedAnswers.filter(a => {
        const timeSpent = a.time_spent || 0
        return timeSpent >= min && timeSpent < range.max
      }).length
      return { time: range.label, count }
    })
  }, [filteredAnswers])

  // 计算难度分析数据
  const difficultyAnalysisData = useMemo(() => {
    if (!selectedPaper || !questionsData?.data) return []

    const questions = selectedPaper.questions || []
    const allQuestions = questionsData.data
    const difficultyCount: Record<string, number> = { easy: 0, medium: 0, hard: 0 }

    questions.forEach(q => {
      const question = allQuestions.find(aq => aq.id === q.id) || q
      const difficulty = question.difficulty || 'medium'
      difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1
    })

    const total = questions.length
    if (total === 0) return []

    return [
      { name: '简单', value: Math.round((difficultyCount.easy / total) * 100), color: '#10B981' },
      { name: '中等', value: Math.round((difficultyCount.medium / total) * 100), color: '#F59E0B' },
      { name: '困难', value: Math.round((difficultyCount.hard / total) * 100), color: '#EF4444' },
    ].filter(item => item.value > 0)
  }, [selectedPaper, questionsData])

  // 刷新数据
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['papers', 'reports'] })
    queryClient.invalidateQueries({ queryKey: ['answers', 'reports'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    toast({
      title: '刷新成功',
      description: '数据已更新',
    })
  }

  // 导出报告
  const handleExport = () => {
    try {
      const workbook = XLSX.utils.book_new()

      // 1. 汇总统计工作表
      const summaryData = [
        ['统计项', '数值'],
        ['总学生数', summaryStats.totalStudents],
        ['平均分', `${summaryStats.averageScore.toFixed(1)}%`],
        ['及格率', `${summaryStats.passRate.toFixed(1)}%`],
        ['完成率', `${summaryStats.completionRate.toFixed(1)}%`],
        ['试卷', selectedPaperId === 'all' ? '全部试卷' : selectedPaper?.title || '未知试卷'],
        ['导出时间', formatDate(new Date())],
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, '汇总统计')

      // 2. 分数分布工作表
      const scoreDistData = [
        ['分数段', '人数'],
        ...scoreDistributionData.map(item => [item.score, item.count]),
      ]
      const scoreDistSheet = XLSX.utils.aoa_to_sheet(scoreDistData)
      XLSX.utils.book_append_sheet(workbook, scoreDistSheet, '分数分布')

      // 3. 题目正确率工作表（仅当选择了具体试卷时）
      if (questionAnalysisData.length > 0) {
        const questionData = [
          ['题目', '正确率(%)'],
          ...questionAnalysisData.map(item => [item.question, item.correctRate]),
        ]
        const questionSheet = XLSX.utils.aoa_to_sheet(questionData)
        XLSX.utils.book_append_sheet(workbook, questionSheet, '题目正确率')
      }

      // 4. 答题时间分析工作表
      const timeData = [
        ['时间区间', '人数'],
        ...timeAnalysisData.map(item => [item.time, item.count]),
      ]
      const timeSheet = XLSX.utils.aoa_to_sheet(timeData)
      XLSX.utils.book_append_sheet(workbook, timeSheet, '答题时间分析')

      // 5. 难度分布工作表（仅当选择了具体试卷时）
      if (difficultyAnalysisData.length > 0) {
        const difficultyData = [
          ['难度', '占比(%)'],
          ...difficultyAnalysisData.map(item => [item.name, item.value]),
        ]
        const difficultySheet = XLSX.utils.aoa_to_sheet(difficultyData)
        XLSX.utils.book_append_sheet(workbook, difficultySheet, '难度分布')
      }

      // 6. 详细答案列表工作表
      const completedAnswers = filteredAnswers?.filter(a => 
        (a.status === 'completed' || a.status === 'graded')
      ) || []
      
      if (completedAnswers.length > 0) {
        const answersData = [
          [
            '学生姓名',
            '学生邮箱',
            '试卷',
            '得分',
            '总分',
            '得分率(%)',
            '状态',
            '开始时间',
            '提交时间',
            '答题时长(分钟)',
          ],
          ...completedAnswers.map(answer => {
            const paper = userPapers.find(p => p.id === answer.paper_id)
            const scoreRate = answer.total_score > 0 
              ? ((answer.score / answer.total_score) * 100).toFixed(1)
              : '0'
            const timeSpent = answer.time_spent 
              ? (answer.time_spent / 60).toFixed(1)
              : '-'
            
            return [
              answer.student_name || '-',
              answer.student_email || '-',
              paper?.title || '未知试卷',
              answer.score,
              answer.total_score,
              scoreRate,
              answer.status === 'completed' ? '已完成' : answer.status === 'graded' ? '已评分' : answer.status,
              formatDate(answer.started_at),
              answer.submitted_at ? formatDate(answer.submitted_at) : '-',
              timeSpent,
            ]
          }),
        ]
        const answersSheet = XLSX.utils.aoa_to_sheet(answersData)
        XLSX.utils.book_append_sheet(workbook, answersSheet, '详细答案')
      }

      // 生成文件名
      const paperName = selectedPaperId === 'all' 
        ? '全部试卷' 
        : selectedPaper?.title || '报告'
      const fileName = `${paperName}_成绩报告_${formatDate(new Date()).replace(/[\/\s:]/g, '_')}.xlsx`

      // 导出文件
      XLSX.writeFile(workbook, fileName)

      toast({
        title: '导出成功',
        description: `报告已导出为 ${fileName}`,
      })
    } catch (error) {
      console.error('导出失败:', error)
      toast({
        title: '导出失败',
        description: '导出过程中发生错误，请稍后重试',
        variant: 'destructive',
      })
    }
  }

  // 查看报告详情
  const handleViewReport = (report: Report) => {
    setSearchParams({ paperId: report.paper_id })
  }

  // 下载报告PDF
  const handleDownloadReport = (report: Report) => {
    if (report.pdf_url) {
      window.open(report.pdf_url, '_blank')
    } else {
      toast({
        title: '暂无PDF',
        description: '该报告尚未生成PDF文件',
      })
    }
  }

  const isLoading = papersLoading || answersLoading || reportsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">成绩分析</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            查看和分析学生的考试成绩数据
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="flex-1 sm:flex-none">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">刷新</span>
          </Button>
          <Button onClick={handleExport} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">导出</span>
          </Button>
        </div>
      </div>

      {/* 试卷选择 */}
      <Card>
        <CardContent className="p-4 sm:pt-6 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium whitespace-nowrap">选择试卷：</label>
            <select
              value={selectedPaperId}
              onChange={(e) => setSearchParams({ paperId: e.target.value })}
              className="w-full sm:w-[300px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">全部试卷</option>
              {userPapers.filter(paper => paper.status === 'published').map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.title}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 概览统计 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">总学生数</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{summaryStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground truncate">
              {selectedPaperId === 'all' ? '所有试卷' : selectedPaper?.title || '当前试卷'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">平均分</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{summaryStats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              已完成答卷的平均得分率
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">及格率</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{summaryStats.passRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              得分≥60%的答卷占比
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">完成率</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{summaryStats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              已完成答卷占比
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表分析 */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* 分数分布 */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">分数分布</CardTitle>
            <CardDescription className="text-xs sm:text-sm">学生成绩分布情况</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {scoreDistributionData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* 难度分析 */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">题目难度分布</CardTitle>
            <CardDescription className="text-xs sm:text-sm">各难度题目占比</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {difficultyAnalysisData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={difficultyAnalysisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {difficultyAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm text-center px-4">
                {selectedPaperId === 'all' ? '请选择具体试卷查看难度分布' : '暂无数据'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 题目正确率 */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">题目正确率分析</CardTitle>
            <CardDescription className="text-xs sm:text-sm">各题目的正确率统计</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {questionAnalysisData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={questionAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}%`, '正确率']} />
                  <Bar dataKey="correctRate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm text-center px-4">
                {selectedPaperId === 'all' ? '请选择具体试卷查看题目分析' : '暂无数据'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 答题时间分析 */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">答题时间分析</CardTitle>
            <CardDescription className="text-xs sm:text-sm">学生答题时间分布</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {timeAnalysisData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 报告列表 */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">历史报告</CardTitle>
          <CardDescription className="text-xs sm:text-sm">查看之前的分析报告</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {reportsData && reportsData.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {reportsData.filter(report => userPapers.some(p => p.id === report.paper_id)).map((report) => {
                const paper = userPapers.find(p => p.id === report.paper_id)
                return (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{paper?.title || '未知试卷'}</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:flex sm:gap-6 mt-2 text-xs sm:text-sm text-gray-600">
                        <span>学生: {report.summary.total_students}</span>
                        <span>平均: {report.summary.average_score.toFixed(1)}%</span>
                        <span>及格: {report.summary.pass_rate.toFixed(1)}%</span>
                        <span>完成: {report.summary.completion_rate.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none h-8 text-xs sm:text-sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none h-8 text-xs sm:text-sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        下载
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
              暂无历史报告
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
