// 类型定义
export interface User {
  id: string
  email: string
  name: string
  role: 'teacher' | 'student' | 'admin'
  plan: 'free' | 'professional' | 'institution' | 'ai_enhanced'
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  user_id: string
  type: 'single' | 'multiple' | 'fill' | 'essay'
  content: string
  options?: string[]
  answer: string | string[]
  explanation?: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  created_at: string
  updated_at: string
}

export interface Paper {
  id: string
  user_id: string
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
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  paper_id: string
  user_id: string
  student_name?: string
  student_email?: string
  responses: Record<string, string | string[]>
  score: number
  total_score: number
  status: 'in_progress' | 'completed' | 'graded'
  started_at: string
  submitted_at?: string
  created_at: string
}

export interface Report {
  id: string
  paper_id: string
  user_id: string
  summary: {
    total_students: number
    average_score: number
    pass_rate: number
    completion_rate: number
  }
  chart_data: {
    score_distribution: Array<{ score: number; count: number }>
    question_analysis: Array<{ question_id: string; correct_rate: number }>
    time_analysis: Array<{ time_range: string; count: number }>
  }
  pdf_url?: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_start: string
  current_period_end: string
  created_at: string
}
