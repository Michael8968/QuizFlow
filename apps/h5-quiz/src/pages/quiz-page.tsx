import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '@quizflow/i18n'
import { useQuizStore } from '@/stores/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, Circle } from 'lucide-react'
import { api } from '@/lib/api'

export function QuizPage() {
  const { t } = useTranslation(['quiz', 'common'])
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { 
    quiz, 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    answers, 
    setAnswer, 
    studentName, 
    studentEmail, 
    startedAt,
    setLoading,
    setSubmitted,
    setError
  } = useQuizStore()
  const [timeLeft, setTimeLeft] = useState(quiz?.settings?.time_limit ? quiz.settings.time_limit * 60 : 0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmitRef = useRef<() => Promise<void>>()

  // 比较答案是否相等（处理数组和字符串）
  const isAnswerCorrect = useCallback((question: any, userAnswers: string | string[]): boolean => {
    if (!question.answer) return false
    
    const correctAnswer = Array.isArray(question.answer) ? question.answer : [question.answer]
    const userAnswerArray = Array.isArray(userAnswers) ? userAnswers : [userAnswers]
    
    // 对数组进行排序后比较（用于多选题）
    if (question.type === 'multiple') {
      const sortedCorrect = [...correctAnswer].sort()
      const sortedUser = [...userAnswerArray].sort()
      return sortedCorrect.length === sortedUser.length && 
             sortedCorrect.every((val, idx) => val === sortedUser[idx])
    }
    
    // 单选题和填空题
    if (question.type === 'single') {
      return correctAnswer[0] === userAnswerArray[0]
    }
    
    // 填空题：简单比较（可以后续优化为模糊匹配）
    if (question.type === 'fill') {
      const userText = (userAnswerArray[0] || '').trim().toLowerCase()
      const correctText = (correctAnswer[0] || '').trim().toLowerCase()
      return userText === correctText
    }
    
    return false
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!quiz || currentQuestionIndex === null) {
      return
    }

    // 防止重复提交
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setLoading(true)
    setError(null)

    try {
      // 保存当前题目的答案
      const question = quiz.questions[currentQuestionIndex]
      setAnswer(question.id, selectedAnswers)

      // 获取包含当前题目答案的所有答案
      const allAnswers = {
        ...answers,
        [question.id]: selectedAnswers
      }

      // 计算答题用时（秒）
      const startedTime = startedAt ? new Date(startedAt).getTime() : Date.now()
      const timeSpent = Math.floor((Date.now() - startedTime) / 1000)

      // 计算总分和实际得分（使用包含当前题目答案的 allAnswers）
      const totalScore = quiz.questions.reduce((sum, q) => sum + q.points, 0)
      let actualScore = 0
      quiz.questions.forEach(q => {
        const userAnswers = allAnswers[q.id]
        if (userAnswers !== undefined && userAnswers !== null) {
          if (q.type === 'single' || q.type === 'multiple') {
            if (isAnswerCorrect(q, userAnswers)) {
              actualScore += q.points
            }
          } else if (q.type === 'fill') {
            const answerArray = Array.isArray(userAnswers) ? userAnswers : [userAnswers]
            if (answerArray.length > 0 && answerArray[0] && answerArray[0].trim()) {
              if (isAnswerCorrect(q, userAnswers)) {
                actualScore += q.points
              }
            }
          }
        }
      })

      // 准备提交数据
      const answerData = {
        paper_id: quiz.id,
        student_name: studentName,
        student_email: studentEmail,
        responses: allAnswers,
        score: actualScore, // 自动计算的分数
        total_score: totalScore,
        status: 'completed',
        started_at: startedAt || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        time_spent: timeSpent,
      }

      // 调用 API 提交答案
      await api.submitAnswer(answerData)

      // 标记为已提交
      setSubmitted(true)

      // Navigate to result page
      navigate(`/result/${quizId}`)
    } catch (error) {
      console.error('Submit answer failed:', error)
      setError(error instanceof Error ? error.message : t('common:message.operationFailed'))
      // Even if submission fails, navigate to result page (show error message)
      navigate(`/result/${quizId}`)
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }, [quiz, currentQuestionIndex, selectedAnswers, answers, studentName, studentEmail, startedAt, isSubmitting, quizId, navigate, setAnswer, setLoading, setSubmitted, setError, isAnswerCorrect])

  // 更新 ref
  useEffect(() => {
    handleSubmitRef.current = handleSubmit
  }, [handleSubmit])

  useEffect(() => {
    if (!quiz) {
      navigate('/')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 使用 ref 来调用，避免依赖问题
          handleSubmitRef.current?.()
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

  if (!quiz || currentQuestionIndex === null) {
    return <div>{t('common:action.loading')}</div>
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
            {t('quiz:taking.question', { current: currentQuestionIndex + 1, total: quiz.questions.length })}
          </p>
        </div>

        {/* Question card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {question.content}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {question.type === 'single' && t('common:status.info')}
              {question.type === 'multiple' && t('common:status.info')}
              {question.type === 'fill' && t('common:status.info')}
              ({question.points} {t('quiz:review.score')})
            </p>
          </CardHeader>
          <CardContent>
            {question.type === 'fill' ? (
              <div>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('quiz:enter.paperCodePlaceholder')}
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

        {/* Action buttons */}
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
            {t('quiz:taking.prev')}
          </Button>

          <Button
            onClick={currentQuestionIndex === quiz.questions.length - 1 ? handleSubmit : handleNext}
            disabled={selectedAnswers.length === 0 || isSubmitting}
          >
            {isSubmitting ? t('common:status.processing') : currentQuestionIndex === quiz.questions.length - 1 ? t('quiz:taking.submit') : t('quiz:taking.next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
