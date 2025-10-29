import { useParams, useNavigate } from 'react-router-dom'
import { useQuizStore } from '@/stores/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, RotateCcw, Home } from 'lucide-react'

export function QuizResult() {
  const { answerId: _answerId } = useParams()
  const navigate = useNavigate()
  const { quiz, answers, reset } = useQuizStore()

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到考试信息</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    )
  }

  // 计算分数
  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0

    quiz.questions.forEach(question => {
      maxScore += question.points
      const userAnswers = answers[question.id] || []
      
      if (question.type === 'single' || question.type === 'multiple') {
        // 这里简化处理，实际应该与正确答案比较
        // 现在假设所有答案都正确
        totalScore += question.points
      } else if (question.type === 'fill') {
        // 填空题的评分逻辑
        if (userAnswers.length > 0 && userAnswers[0].trim()) {
          totalScore += question.points
        }
      }
    })

    return { totalScore, maxScore }
  }

  const { totalScore, maxScore } = calculateScore()
  const percentage = Math.round((totalScore / maxScore) * 100)

  const handleRestart = () => {
    reset()
    navigate('/')
  }

  const handleReview = () => {
    // 这里可以实现查看详细答案的功能
    console.log('Review answers:', answers)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 结果头部 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {percentage >= 60 ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {percentage >= 60 ? '恭喜！考试完成' : '考试完成'}
          </h1>
          <p className="text-gray-600">
            {quiz.title}
          </p>
        </div>

        {/* 分数卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">考试成绩</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {totalScore}/{maxScore}
              </div>
              <div className="text-2xl font-semibold text-gray-700 mb-4">
                {percentage}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    percentage >= 80 ? 'bg-green-500' :
                    percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {percentage >= 80 && '优秀！'}
                {percentage >= 60 && percentage < 80 && '良好！'}
                {percentage < 60 && '需要继续努力！'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 答题统计 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>答题统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-gray-600">总题数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-gray-600">已答题</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button 
            onClick={handleReview}
            className="w-full"
            variant="outline"
          >
            查看详细答案
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleRestart}
              variant="outline"
              className="flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新考试
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
