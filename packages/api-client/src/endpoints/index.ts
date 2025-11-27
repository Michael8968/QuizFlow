export { BaseEndpoint } from './base.endpoint';
export { AuthEndpoint, type LoginRequest, type RegisterRequest, type AuthResponse, type RefreshTokenResponse } from './auth.endpoint';
export { QuestionsEndpoint, type CreateQuestionRequest, type UpdateQuestionRequest, type QueryQuestionsParams } from './questions.endpoint';
export { PapersEndpoint, type CreatePaperRequest, type UpdatePaperRequest, type QueryPapersParams } from './papers.endpoint';
export { AnswersEndpoint, type SubmitAnswerRequest, type UpdateScoreRequest, type QueryAnswersParams, type AnswerStats } from './answers.endpoint';
export { ReportsEndpoint, type ReportWithPaper, type QueryReportsParams } from './reports.endpoint';
export { AiEndpoint, type GenerateQuestionsRequest, type AnalyzeAnswerRequest, type AnalysisResult } from './ai.endpoint';
