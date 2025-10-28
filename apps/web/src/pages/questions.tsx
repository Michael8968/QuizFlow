import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { getQuestionTypeLabel, getDifficultyColor } from '@/lib/utils'

// 模拟数据
const mockQuestions = [
  {
    id: '1',
    type: 'single',
    content: '下列哪个是 JavaScript 的基本数据类型？',
    options: ['String', 'Object', 'Array', 'Function'],
    answer: 'String',
    difficulty: 'easy',
    tags: ['JavaScript', '基础'],
    points: 5,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'multiple',
    content: '以下哪些是 React 的特点？',
    options: ['虚拟DOM', '组件化', '双向数据绑定', '单向数据流'],
    answer: ['虚拟DOM', '组件化', '单向数据流'],
    difficulty: 'medium',
    tags: ['React', '前端'],
    points: 10,
    created_at: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    type: 'fill',
    content: '在 CSS 中，使用 _____ 属性可以设置元素的背景颜色。',
    answer: 'background-color',
    difficulty: 'easy',
    tags: ['CSS', '样式'],
    points: 3,
    created_at: '2024-01-13T09:15:00Z',
  },
]

export function Questions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [questions] = useState(mockQuestions)

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">题库管理</h1>
          <p className="mt-2 text-gray-600">
            管理您的题目库，创建、编辑和组织题目
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加题目
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索题目内容或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">所有难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                更多筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                  <p className="text-gray-900 mb-3">{question.content}</p>
                  {question.options && (
                    <div className="space-y-1 mb-3">
                      {question.options.map((option, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {String.fromCharCode(65 + index)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
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
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">没有找到匹配的题目</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              添加第一道题目
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
