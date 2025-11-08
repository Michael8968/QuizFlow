import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Users, 
  Plus,
  TrendingUp,
  Clock,
  Loader2
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

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          欢迎回来，{user?.name}！
        </h1>
        <p className="mt-2 text-gray-600">
          管理您的题库、创建试卷并分析学生成绩
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总题目数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              总题目数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">试卷数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPapers}</div>
            <p className="text-xs text-muted-foreground">
              总试卷数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">答卷数量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnswers}</div>
            <p className="text-xs text-muted-foreground">
              总答卷数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均分</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              平均得分率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
            <CardDescription>
              快速开始您的工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              onClick={() => navigate('/questions')}
            >
              <Plus className="mr-2 h-4 w-4" />
              添加新题目
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/papers')}
            >
              <FileText className="mr-2 h-4 w-4" />
              创建新试卷
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/reports')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              查看成绩分析
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              您的最新操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">暂无活动记录</p>
              ) : (
                recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'paper' && <FileText className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'question' && <BookOpen className="h-4 w-4 text-green-500" />}
                    {activity.type === 'answer' && <Users className="h-4 w-4 text-orange-500" />}
                    {activity.type === 'report' && <BarChart3 className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'published' ? 'bg-green-100 text-green-800' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
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
