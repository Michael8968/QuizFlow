import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '@quizflow/i18n'
import { useQuizStore } from '@/stores/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, RotateCcw, Home, X, CheckCircle2 } from 'lucide-react'
import type { QuizQuestionWithAnswer } from '@quizflow/types'

export function QuizResult() {
  const { t } = useTranslation(['quiz', 'common'])
  const { answerId: _answerId } = useParams()
  const navigate = useNavigate()
  const { quiz, answers, reset } = useQuizStore()
  const [showReview, setShowReview] = useState(false)

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('common:message.noData')}</p>
          <Button onClick={() => navigate('/')}>{t('quiz:result.backToHome')}</Button>
        </div>
      </div>
    )
  }

  // 比较答案是否相等（处理数组和字符串）
  const isAnswerCorrect = (question: QuizQuestionWithAnswer, userAnswers: string | string[]): boolean => {
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
  }

  // 计算分数
  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0
    let answeredCount = 0

    quiz.questions.forEach(question => {
      maxScore += question.points
      const userAnswers = answers[question.id]
      
      // 计算已答题数量
      if (userAnswers !== undefined && userAnswers !== null) {
        const answerArray = Array.isArray(userAnswers) ? userAnswers : [userAnswers]
        if (answerArray.length > 0 && answerArray.some(a => a && String(a).trim())) {
          answeredCount++
        }
      }
      
      // 计算得分
      if (userAnswers !== undefined && userAnswers !== null) {
        if (question.type === 'single' || question.type === 'multiple') {
          if (isAnswerCorrect(question, userAnswers)) {
            totalScore += question.points
          }
        } else if (question.type === 'fill') {
          const answerArray = Array.isArray(userAnswers) ? userAnswers : [userAnswers]
          if (answerArray.length > 0 && answerArray[0] && answerArray[0].trim()) {
            if (isAnswerCorrect(question, userAnswers)) {
              totalScore += question.points
            }
          }
        }
      }
    })

    return { totalScore, maxScore, answeredCount }
  }

  const { totalScore, maxScore, answeredCount } = calculateScore()
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  const handleRestart = () => {
    reset()
    navigate('/')
  }

  const handleReview = () => {
    setShowReview(true)
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
            {percentage >= 60 ? t('quiz:result.passed') : t('quiz:result.title')}
          </h1>
          <p className="text-gray-600">
            {quiz.title}
          </p>
        </div>

        {/* Score card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">{t('quiz:result.score')}</CardTitle>
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
                {percentage >= 80 && t('quiz:result.passed')}
                {percentage >= 60 && percentage < 80 && t('quiz:result.passed')}
                {percentage < 60 && t('quiz:result.failed')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Answer statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('quiz:result.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-gray-600">{t('quiz:info.totalQuestions')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {answeredCount}
                </div>
                <div className="text-sm text-gray-600">{t('quiz:taking.answered')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleReview}
            className="w-full"
            variant="outline"
          >
            {t('quiz:result.viewDetail')}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('quiz:result.retake')}
            </Button>

            <Button
              onClick={() => navigate('/')}
              className="flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              {t('quiz:result.backToHome')}
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed answer review modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">{t('quiz:review.title')}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReview(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {quiz.questions.map((question, index) => {
                const userAnswers = answers[question.id]
                const userAnswerArray = userAnswers 
                  ? (Array.isArray(userAnswers) ? userAnswers : [userAnswers])
                  : []
                const correctAnswer = question.answer
                  ? (Array.isArray(question.answer) ? question.answer : [question.answer])
                  : []
                const isCorrect = userAnswers !== undefined && isAnswerCorrect(question, userAnswers || [])
                
                return (
                  <Card key={question.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">
                            {t('quiz:taking.question', { current: index + 1, total: quiz.questions.length })}
                            <span className="text-sm text-gray-500 ml-2">({question.points} {t('quiz:review.score')})</span>
                          </CardTitle>
                          <p className="text-gray-700 mb-3">{question.content}</p>
                        </div>
                        <div className="ml-4">
                          {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 选项显示（选择题） */}
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isUserSelected = userAnswerArray.includes(option)
                            const isCorrectOption = correctAnswer.includes(option)
                            
                            return (
                              <div
                                key={optIndex}
                                className={`p-2 rounded border ${
                                  isCorrectOption
                                    ? 'bg-green-50 border-green-300'
                                    : isUserSelected && !isCorrectOption
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center">
                                  {isCorrectOption && (
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                  )}
                                  {isUserSelected && !isCorrectOption && (
                                    <XCircle className="w-4 h-4 text-red-600 mr-2" />
                                  )}
                                  <span className={isCorrectOption ? 'font-semibold text-green-700' : ''}>
                                    {option}
                                  </span>
                                  {isCorrectOption && (
                                    <span className="ml-2 text-xs text-green-600">({t('quiz:review.correctAnswer')})</span>
                                  )}
                                  {isUserSelected && !isCorrectOption && (
                                    <span className="ml-2 text-xs text-red-600">({t('quiz:review.yourAnswer')})</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Fill-in answer display */}
                      {question.type === 'fill' && (
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-sm text-gray-600 mb-1">{t('quiz:review.yourAnswer')}:</div>
                            <div className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-700'}>
                              {userAnswerArray[0] || `(${t('quiz:taking.unanswered')})`}
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            <div className="text-sm text-gray-600 mb-1">{t('quiz:review.correctAnswer')}:</div>
                            <div className="text-green-700 font-semibold">
                              {correctAnswer[0] || `(${t('common:message.noData')})`}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analysis */}
                      {question.explanation && (
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="text-sm font-semibold text-blue-900 mb-1">{t('quiz:review.analysis')}:</div>
                          <div className="text-sm text-blue-800">{question.explanation}</div>
                        </div>
                      )}

                      {/* Score */}
                      <div className="text-sm text-gray-600">
                        {t('quiz:review.score')}: {isCorrect ? question.points : 0} / {question.points}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="p-4 border-t">
              <Button
                onClick={() => setShowReview(false)}
                className="w-full"
              >
                {t('common:action.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
