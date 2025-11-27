import type { Question, QuizQuestion, QuizQuestionWithAnswer } from './question';

/**
 * 试卷状态
 */
export type PaperStatus = 'draft' | 'published' | 'archived';

/**
 * 试卷设置
 */
export interface PaperSettings {
  /** 答题时间限制（分钟） */
  time_limit?: number;
  /** 是否打乱题目顺序 */
  shuffle_questions: boolean;
  /** 是否打乱选项顺序 */
  shuffle_options: boolean;
  /** 提交后是否显示正确答案 */
  show_correct_answer: boolean;
  /** 是否允许回顾答题 */
  allow_review: boolean;
}

/**
 * 试卷基础信息
 */
export interface PaperBase {
  title: string;
  description?: string;
  settings: PaperSettings;
}

/**
 * 完整试卷信息（教师端）
 */
export interface Paper extends PaperBase {
  id: string;
  user_id: string;
  questions: Question[];
  status: PaperStatus;
  quiz_code?: string;
  created_at: string;
  updated_at: string;
}

/**
 * H5 答卷用的试卷（学生端，不含答案）
 */
export interface Quiz extends PaperBase {
  id: string;
  questions: QuizQuestion[];
  quiz_code: string;
  created_at: string;
}

/**
 * 答卷结果用的试卷（包含答案）
 */
export interface QuizWithAnswers extends PaperBase {
  id: string;
  questions: QuizQuestionWithAnswer[];
  quiz_code: string;
  created_at: string;
}

/**
 * 创建试卷请求
 */
export interface CreatePaperDto extends PaperBase {
  question_ids: string[];
  status?: PaperStatus;
}

/**
 * 更新试卷请求
 */
export interface UpdatePaperDto extends Partial<CreatePaperDto> {}
