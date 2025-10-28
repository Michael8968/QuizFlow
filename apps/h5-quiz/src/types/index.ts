// H5 答卷相关类型定义
export interface Quiz {
  id: string
  title: string
  description?: string
  questions: Question[]
  settings: {
    time_limit?: number
    shuffle_questions: boolean
    shuffle_options: boolean
    show_correct_answer: boolean
    allow_review: boolean
  }
  created_at: string
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'fill' | 'essay'
  content: string
  options?: string[]
  answer?: string | string[]
  explanation?: string
  points: number
  order: number
}

export interface Answer {
  id: string
  quiz_id: string
  student_name?: string
  student_email?: string
  responses: Record<string, string | string[]>
  score: number
  total_score: number
  status: 'in_progress' | 'completed' | 'graded'
  started_at: string
  submitted_at?: string
  time_spent: number
}

export interface QuizState {
  quiz: Quiz | null
  currentQuestionIndex: number
  answers: Record<string, string | string[]>
  timeRemaining: number
  isSubmitted: boolean
  isLoading: boolean
  error: string | null
}
