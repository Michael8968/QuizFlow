import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, Copy, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// 模拟数据
const mockPapers = [
  {
    id: '1',
    title: 'JavaScript 基础测试',
    description: '测试学生对 JavaScript 基础知识的掌握程度',
    questionCount: 20,
    timeLimit: 60,
    status: 'published',
    createdAt: '2024-01-15T10:30:00Z',
    answerCount: 15,
    averageScore: 78.5,
  },
  {
    id: '2',
    title: 'React 组件开发',
    description: 'React 组件开发相关知识点测试',
    questionCount: 15,
    timeLimit: 45,
    status: 'draft',
    createdAt: '2024-01-14T15:20:00Z',
    answerCount: 0,
    averageScore: 0,
  },
  {
    id: '3',
    title: 'CSS 布局与样式',
    description: 'CSS 布局和样式相关题目',
    questionCount: 12,
    timeLimit: 30,
    status: 'published',
    createdAt: '2024-01-13T09:15:00Z',
    answerCount: 8,
    averageScore: 85.2,
  },
]

export function Papers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [papers] = useState(mockPapers)

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
      case 'archived':
        return '已归档'
      default:
        return '未知'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">试卷管理</h1>
          <p className="mt-2 text-gray-600">
            创建和管理您的试卷，设置考试参数
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          创建试卷
        </Button>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索试卷标题或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 试卷列表 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPapers.map((paper) => (
          <Card key={paper.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{paper.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {paper.description}
                  </CardDescription>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                  {getStatusText(paper.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>题目数量</span>
                  <span>{paper.questionCount} 题</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>时间限制</span>
                  <span>{paper.timeLimit} 分钟</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>答卷数量</span>
                  <span>{paper.answerCount} 份</span>
                </div>
                {paper.answerCount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>平均分</span>
                    <span>{paper.averageScore}%</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>创建时间</span>
                  <span>{formatDate(paper.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  预览
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {paper.answerCount > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  查看分析报告
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">没有找到匹配的试卷</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              创建第一份试卷
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
