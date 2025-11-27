import type { QuestionType, DifficultyLevel } from './question';

/**
 * AI 生成题目请求
 */
export interface GenerateQuestionsDto {
  /** 题目主题/知识点 */
  prompt: string;
  /** 生成数量 */
  count: number;
  /** 题目类型 */
  type: QuestionType;
  /** 难度（可选） */
  difficulty?: DifficultyLevel;
}

/**
 * AI 生成的题目（未保存）
 */
export interface GeneratedQuestion {
  type: QuestionType;
  content: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
  difficulty: DifficultyLevel;
  points: number;
  tags: string[];
}

/**
 * AI 生成题目响应
 */
export interface GenerateQuestionsResponse {
  questions: GeneratedQuestion[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
