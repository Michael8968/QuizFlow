import { BaseEndpoint } from './base.endpoint';
import type { ApiClient, ClientApiResponse } from '../client';
import type { Question, QuestionType } from '@quizflow/types';

/**
 * AI 生成题目请求参数
 */
export interface GenerateQuestionsRequest {
  topic: string;
  count?: number;
  types?: QuestionType[];
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
}

/**
 * AI 分析答卷请求参数
 */
export interface AnalyzeAnswerRequest {
  answer_id: string;
  include_suggestions?: boolean;
}

/**
 * AI 分析结果
 */
export interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions?: string[];
  score_breakdown?: Record<string, number>;
}

/**
 * AI 相关 API
 */
export class AiEndpoint extends BaseEndpoint {
  constructor(client: ApiClient) {
    super(client, '/ai');
  }

  /**
   * AI 生成题目
   */
  async generateQuestions(
    data: GenerateQuestionsRequest
  ): Promise<ClientApiResponse<Question[]>> {
    return this.doPost<Question[]>('/generate-questions', data);
  }

  /**
   * AI 分析答卷
   */
  async analyzeAnswer(data: AnalyzeAnswerRequest): Promise<ClientApiResponse<AnalysisResult>> {
    return this.doPost<AnalysisResult>('/analyze-answer', data);
  }

  /**
   * AI 评分主观题
   */
  async gradeSubjective(
    questionId: string,
    answer: string
  ): Promise<ClientApiResponse<{ score: number; feedback: string }>> {
    return this.doPost<{ score: number; feedback: string }>('/grade-subjective', {
      question_id: questionId,
      answer,
    });
  }

  /**
   * AI 生成题目解析
   */
  async generateExplanation(questionId: string): Promise<ClientApiResponse<string>> {
    return this.doPost<string>('/generate-explanation', {
      question_id: questionId,
    });
  }
}
