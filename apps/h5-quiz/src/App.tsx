import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from '@/components/quiz/quiz-provider'
import { EnterQuiz } from '@/pages/enter-quiz'
import { QuizPage } from '@/pages/quiz-page'
import { QuizResult } from '@/pages/quiz-result'

function App() {
  return (
    <QuizProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<EnterQuiz />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/result/:answerId" element={<QuizResult />} />
        </Routes>
      </div>
    </QuizProvider>
  )
}

export default App
