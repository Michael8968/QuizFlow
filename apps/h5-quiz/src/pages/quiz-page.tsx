import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuizStore } from '@/stores/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, Circle } from 'lucide-react'

export function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { quiz, currentQuestionIndex, setCurrentQuestionIndex, answers, setAnswer } = useQuizStore()
  const [timeLeft, setTimeLeft] = useState(quiz?.settings?.time_limit ? quiz.settings.time_limit * 60 : 0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])

  useEffect(() => {
    if (!quiz) {
      navigate('/')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, navigate])

  const handleAnswerChange = (answer: string, isMultiple: boolean) => {
    if (isMultiple) {
      setSelectedAnswers(prev => 
        prev.includes(answer) 
          ? prev.filter(a => a !== answer)
          : [...prev, answer]
      )
    } else {
      setSelectedAnswers([answer])
    }
  }

  const handleNext = () => {
    if (quiz && currentQuestionIndex !== null) {
      const question = quiz.questions[currentQuestionIndex]
      setAnswer(question.id, selectedAnswers)
      
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        const nextAnswers = answers[quiz.questions[currentQuestionIndex + 1]?.id]
        setSelectedAnswers(Array.isArray(nextAnswers) ? nextAnswers : nextAnswers ? [nextAnswers] : [])
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = () => {
    if (quiz && currentQuestionIndex !== null) {
      const question = quiz.questions[currentQuestionIndex]
      setAnswer(question.id, selectedAnswers)
    }
    navigate(`/result/${quizId}`)
  }

  if (!quiz || currentQuestionIndex === null) {
    return <div>加载中...</div>
  }

  const question = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部信息 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <div className="flex items-center text-red-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            第 {currentQuestionIndex + 1} 题，共 {quiz.questions.length} 题
          </p>
        </div>

        {/* 题目卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {question.content}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {question.type === 'single' && '单选题'}
              {question.type === 'multiple' && '多选题'}
              {question.type === 'fill' && '填空题'}
              （{question.points} 分）
            </p>
          </CardHeader>
          <CardContent>
            {question.type === 'fill' ? (
              <div>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入答案"
                  value={selectedAnswers[0] || ''}
                  onChange={(e) => setSelectedAnswers([e.target.value])}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                      name={`question-${question.id}`}
                      value={option}
                      checked={selectedAnswers.includes(option)}
                      onChange={() => handleAnswerChange(option, question.type === 'multiple')}
                      className="sr-only"
                    />
                    <div className="flex items-center w-full">
                      {question.type === 'multiple' ? (
                        selectedAnswers.includes(option) ? (
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mr-3" />
                        )
                      ) : (
                        selectedAnswers.includes(option) ? (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-600 mr-3 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-400 mr-3" />
                        )
                      )}
                      <span className="flex-1">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1)
                const prevQuestion = quiz.questions[currentQuestionIndex - 1]
                const prevAnswers = answers[prevQuestion.id]
                setSelectedAnswers(Array.isArray(prevAnswers) ? prevAnswers : prevAnswers ? [prevAnswers] : [])
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            上一题
          </Button>
          
          <Button
            onClick={currentQuestionIndex === quiz.questions.length - 1 ? handleSubmit : handleNext}
            disabled={selectedAnswers.length === 0}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? '提交答案' : '下一题'}
          </Button>
        </div>
      </div>
    </div>
  )
}
