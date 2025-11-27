/**
 * 答卷状态
 */
export type AnswerStatus = 'in_progress' | 'completed' | 'graded';

/**
 * 答题响应记录
 * key: 题目 ID, value: 选择的答案
 */
export type QuestionResponses = Record<string, string | string[]>;

/**
 * 答卷基础信息
 */
export interface AnswerBase {
  student_name?: string;
  student_email?: string;
  responses: QuestionResponses;
}

/**
 * 完整答卷信息（教师端）
 */
export interface Answer extends AnswerBase {
  id: string;
  paper_id: string;
  user_id?: string;
  score: number;
  total_score: number;
  status: AnswerStatus;
  started_at: string;
  submitted_at?: string;
  created_at: string;
}

/**
 * H5 答卷信息（学生端）
 */
export interface QuizAnswer extends AnswerBase {
  id: string;
  quiz_id: string;
  score: number;
  total_score: number;
  status: AnswerStatus;
  started_at: string;
  submitted_at?: string;
  time_spent: number;
}

/**
 * 提交答卷请求
 */
export interface SubmitAnswerDto extends AnswerBase {
  quiz_code: string;
  time_spent: number;
}

/**
 * H5 答卷状态（前端状态管理用）
 * 使用 QuizWithAnswers 以便在结果页面访问答案
 */
export interface QuizState {
  quiz: import('./paper').QuizWithAnswers | null;
  currentQuestionIndex: number;
  answers: QuestionResponses;
  timeRemaining: number;
  isSubmitted: boolean;
  isLoading: boolean;
  error: string | null;
  studentName?: string;
  studentEmail?: string;
  startedAt?: string;
}
