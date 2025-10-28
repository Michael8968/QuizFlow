import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Download, Eye, RefreshCw } from 'lucide-react'

// 模拟数据
const scoreDistributionData = [
  { score: '0-20', count: 2 },
  { score: '21-40', count: 3 },
  { score: '41-60', count: 8 },
  { score: '61-80', count: 15 },
  { score: '81-100', count: 12 },
]

const questionAnalysisData = [
  { question: 'Q1', correctRate: 85 },
  { question: 'Q2', correctRate: 72 },
  { question: 'Q3', correctRate: 90 },
  { question: 'Q4', correctRate: 68 },
  { question: 'Q5', correctRate: 78 },
  { question: 'Q6', correctRate: 82 },
  { question: 'Q7', correctRate: 75 },
  { question: 'Q8', correctRate: 88 },
]

const timeAnalysisData = [
  { time: '0-10min', count: 5 },
  { time: '10-20min', count: 8 },
  { time: '20-30min', count: 12 },
  { time: '30-40min', count: 15 },
  { time: '40-50min', count: 8 },
  { time: '50-60min', count: 2 },
]

const difficultyAnalysisData = [
  { name: '简单', value: 35, color: '#10B981' },
  { name: '中等', value: 45, color: '#F59E0B' },
  { name: '困难', value: 20, color: '#EF4444' },
]

const mockReports = [
  {
    id: '1',
    paperTitle: 'JavaScript 基础测试',
    totalStudents: 40,
    averageScore: 78.5,
    passRate: 85,
    completionRate: 95,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    paperTitle: 'React 组件开发',
    totalStudents: 25,
    averageScore: 82.3,
    passRate: 88,
    completionRate: 100,
    createdAt: '2024-01-14T15:20:00Z',
  },
]

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">成绩分析</h1>
          <p className="mt-2 text-gray-600">
            查看和分析学生的考试成绩数据
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新数据
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总学生数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40</div>
            <p className="text-xs text-muted-foreground">
              +5 比上周
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% 比上周
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">及格率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +3.2% 比上周
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              +1.5% 比上周
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表分析 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 分数分布 */}
        <Card>
          <CardHeader>
            <CardTitle>分数分布</CardTitle>
            <CardDescription>学生成绩分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 难度分析 */}
        <Card>
          <CardHeader>
            <CardTitle>题目难度分布</CardTitle>
            <CardDescription>各难度题目占比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyAnalysisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyAnalysisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 题目正确率 */}
        <Card>
          <CardHeader>
            <CardTitle>题目正确率分析</CardTitle>
            <CardDescription>各题目的正确率统计</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, '正确率']} />
                <Bar dataKey="correctRate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 答题时间分析 */}
        <Card>
          <CardHeader>
            <CardTitle>答题时间分析</CardTitle>
            <CardDescription>学生答题时间分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 报告列表 */}
      <Card>
        <CardHeader>
          <CardTitle>历史报告</CardTitle>
          <CardDescription>查看之前的分析报告</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{report.paperTitle}</h3>
                  <div className="flex gap-6 mt-2 text-sm text-gray-600">
                    <span>学生数: {report.totalStudents}</span>
                    <span>平均分: {report.averageScore}%</span>
                    <span>及格率: {report.passRate}%</span>
                    <span>完成率: {report.completionRate}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    查看
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
