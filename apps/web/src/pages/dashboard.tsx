import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  FileText,
  BarChart3,
  Users,
  Plus,
  TrendingUp,
  Clock,
  Loader2,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Question, Paper, Answer, Report } from '@/types'
import { formatTimeAgo } from '@/lib/utils'
import { useMemo } from 'react'

interface Activity {
  id: string
  type: 'paper' | 'question' | 'answer' | 'report'
  title: string
  time: string
  status: 'published' | 'completed' | 'new'
  createdAt: string
}

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // 获取题目列表
  const { data: questionsData, isLoading: questionsLoading } = useQuery<{ data?: Question[]; count?: number }>({
    queryKey: ['questions', 'dashboard'],
    queryFn: async () => {
      return await api.getQuestions({ limit: 1000 }) as { data?: Question[]; count?: number }
    },
  })

  // 获取试卷列表
  const { data: papersData, isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ['papers', 'dashboard'],
    queryFn: async () => {
      const response = await api.getPapers() as Paper[]
      return response || []
    },
  })

  // 获取所有试卷的答案
  const { data: allAnswers, isLoading: answersLoading } = useQuery<Answer[]>({
    queryKey: ['answers', 'dashboard', papersData?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!papersData || papersData.length === 0) return []
      
      // 获取所有试卷的答案
      const answersPromises = papersData.map(paper => 
        api.getAnswers(paper.id)
          .then((response: any) => {
            // 确保返回的是数组
            return Array.isArray(response) ? response : []
          })
          .catch(() => []) // 如果获取失败，返回空数组
      )
      const answersArrays = await Promise.all(answersPromises)
      return answersArrays.flat() as Answer[]
    },
    enabled: !!papersData && papersData.length > 0,
  })

  // 获取报告列表
  const { data: reportsData, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const response = await api.getReports() as Report[]
      return response || []
    },
  })

  // 计算统计数据
  const stats = useMemo(() => {
    const questions = questionsData?.data || []
    const allPapers = papersData || []
    const answers = allAnswers || []
    
    // 权限过滤：只统计当前用户的试卷
    const papers = user ? allPapers.filter(paper => paper.user_id === user.id) : []
    
    // 计算总题目数（只统计当前用户的题目）
    const userQuestions = user ? questions.filter(q => q.user_id === user.id) : []
    const totalQuestions = userQuestions.length

    // 计算试卷数量（只统计当前用户的试卷）
    const totalPapers = papers.length

    // 计算答卷数量（只统计当前用户试卷的答卷）
    const userPaperIds = papers.map(p => p.id)
    const userAnswers = answers.filter(a => userPaperIds.includes(a.paper_id))
    const totalAnswers = userAnswers.length

    // 计算平均分（只计算已完成的答卷，且只统计当前用户试卷的答卷）
    // 过滤出已完成或已评分的答卷，并排除无效数据
    const completedAnswers = userAnswers.filter(a => 
      (a.status === 'completed' || a.status === 'graded') &&
      a.total_score > 0 && // 总分必须大于0
      a.score >= 0 && // 得分不能为负数
      isFinite(a.score) && // 得分必须是有效数字
      isFinite(a.total_score) // 总分必须是有效数字
    )
    console.log( 'completedAnswers', completedAnswers)
    
    const averageScore = completedAnswers.length > 0
      ? completedAnswers.reduce((sum, a) => {
          // 计算得分率（百分比），确保在 0-100% 之间
          const scoreRate = Math.min(100, Math.max(0, (a.score / a.total_score) * 100))
          return sum + scoreRate
        }, 0) / completedAnswers.length
      : 0

    return {
      totalQuestions,
      totalPapers,
      totalAnswers,
      averageScore: Math.round(averageScore * 10) / 10, // 保留一位小数
    }
  }, [questionsData, papersData, allAnswers, user])

  // 计算最近活动
  const recentActivities = useMemo<Activity[]>(() => {
    const activities: Activity[] = []
    const allPapers = papersData || []
    const allQuestions = questionsData?.data || []
    const allAnswersData = allAnswers || []
    const allReports = reportsData || []

    // 权限过滤：只显示当前用户的数据
    const papers = user ? allPapers.filter(paper => paper.user_id === user.id) : []
    const questions = user ? allQuestions.filter(q => q.user_id === user.id) : []
    const userPaperIds = papers.map(p => p.id)
    const answers = allAnswersData.filter(a => userPaperIds.includes(a.paper_id))
    const reports = user ? allReports.filter(r => r.user_id === user.id) : []

    // 添加试卷活动
    papers.slice(0, 5).forEach(paper => {
      activities.push({
        id: `paper-${paper.id}`,
        type: 'paper',
        title: paper.title,
        time: formatTimeAgo(paper.created_at),
        status: paper.status === 'published' ? 'published' : 'completed',
        createdAt: paper.created_at,
      })
    })

    // 添加题目活动（最近创建的）
    questions.slice(0, 3).forEach(question => {
      activities.push({
        id: `question-${question.id}`,
        type: 'question',
        title: `添加了新题目：${question.content.substring(0, 30)}${question.content.length > 30 ? '...' : ''}`,
        time: formatTimeAgo(question.created_at),
        status: 'completed',
        createdAt: question.created_at,
      })
    })

    // 添加答卷活动（最近提交的）
    answers
      .filter(a => a.status === 'completed' || a.status === 'graded')
      .slice(0, 3)
      .forEach(answer => {
        const paper = papers.find(p => p.id === answer.paper_id)
        activities.push({
          id: `answer-${answer.id}`,
          type: 'answer',
          title: `收到答卷：${answer.student_name || '匿名'} - ${paper?.title || '未知试卷'}`,
          time: formatTimeAgo(answer.submitted_at || answer.created_at),
          status: 'new',
          createdAt: answer.submitted_at || answer.created_at,
        })
      })

    // 添加报告活动
    reports.slice(0, 2).forEach(report => {
      const paper = papers.find(p => p.id === report.paper_id)
      activities.push({
        id: `report-${report.id}`,
        type: 'report',
        title: `生成了成绩报告：${paper?.title || '未知试卷'}`,
        time: formatTimeAgo(report.created_at),
        status: 'completed',
        createdAt: report.created_at,
      })
    })

    // 按创建时间排序，取最近10条
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  }, [papersData, questionsData, allAnswers, reportsData, user])

  const isLoading = questionsLoading || papersLoading || answersLoading || reportsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const isProfessional = ['professional', 'institution', 'ai_enhanced'].includes(user?.plan || '')

  return (
    <div className="space-y-8">
      {/* 欢迎区域 - 增强视觉效果 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              欢迎回来，{user?.name}！
            </h1>
            {isProfessional && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                {user?.plan === 'professional' ? '专业版' :
                 user?.plan === 'institution' ? '机构版' : 'AI增强版'}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 max-w-2xl">
            管理您的题库、创建试卷并分析学生成绩。今天也是高效工作的一天！
          </p>
        </div>
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
          <BookOpen className="w-64 h-64 text-primary" />
        </div>
      </div>

      {/* 统计卡片 - 增强样式 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">总题目数</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">
              题库中的题目总数
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">试卷数量</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPapers}</div>
            <p className="text-xs text-gray-500 mt-1">
              已创建的试卷
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">答卷数量</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalAnswers}</div>
            <p className="text-xs text-gray-500 mt-1">
              收到的答卷总数
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">平均得分</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              学生平均得分率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              快捷操作
            </CardTitle>
            <CardDescription>
              快速开始您的工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-between group"
              onClick={() => navigate('/questions')}
            >
              <span className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                添加新题目
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
            {isProfessional && (
              <Button
                variant="outline"
                className="w-full justify-between group bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
                onClick={() => navigate('/questions')}
              >
                <span className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
                  AI 智能出题
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-between group"
              onClick={() => navigate('/papers')}
            >
              <span className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                创建新试卷
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between group"
              onClick={() => navigate('/reports')}
            >
              <span className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                查看成绩分析
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              最近活动
            </CardTitle>
            <CardDescription>
              您的最新操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">暂无活动记录</p>
                  <p className="text-xs text-gray-400 mt-1">开始创建题目或试卷吧</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'paper' ? 'bg-blue-100' :
                        activity.type === 'question' ? 'bg-green-100' :
                        activity.type === 'answer' ? 'bg-orange-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'paper' && <FileText className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'question' && <BookOpen className="h-4 w-4 text-green-600" />}
                        {activity.type === 'answer' && <Users className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'report' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'published' ? 'bg-green-100 text-green-700' :
                        activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {activity.status === 'published' ? '已发布' :
                         activity.status === 'completed' ? '已完成' : '新'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
