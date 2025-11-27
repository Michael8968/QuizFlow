/**
 * 题目类型
 */
export type QuestionType = 'single' | 'multiple' | 'fill' | 'essay';

/**
 * 难度等级
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * 题目基础信息
 */
export interface QuestionBase {
  type: QuestionType;
  content: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
  tags: string[];
  difficulty: DifficultyLevel;
  points: number;
}

/**
 * 完整题目信息（包含数据库字段）
 */
export interface Question extends QuestionBase {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * 创建题目请求
 */
export interface CreateQuestionDto extends QuestionBase {}

/**
 * 更新题目请求
 */
export interface UpdateQuestionDto extends Partial<QuestionBase> {}

/**
 * H5 答卷中的题目（不包含答案，用于学生端）
 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  points: number;
  order: number;
}

/**
 * 答卷结果中的题目（包含答案和解析，用于结果展示）
 */
export interface QuizQuestionWithAnswer extends QuizQuestion {
  answer: string | string[];
  explanation?: string;
}
