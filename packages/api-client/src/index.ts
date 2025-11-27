// Core client
export {
  ApiClient,
  createApiClient,
  type ApiClientConfig,
  type RequestConfig,
  type ClientApiResponse,
  type InterceptorContext,
  type ResponseContext,
  type ErrorContext,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
} from './client';

// Interceptors
export {
  createAuthInterceptor,
  createErrorInterceptor,
  createRetryInterceptor,
  getErrorMessage,
  ERROR_MESSAGES,
  type AuthInterceptorConfig,
  type ErrorInterceptorConfig,
  type RetryInterceptorConfig,
} from './interceptors';

// Endpoints
export {
  BaseEndpoint,
  AuthEndpoint,
  QuestionsEndpoint,
  PapersEndpoint,
  AnswersEndpoint,
  ReportsEndpoint,
  AiEndpoint,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type RefreshTokenResponse,
  type CreateQuestionRequest,
  type UpdateQuestionRequest,
  type QueryQuestionsParams,
  type CreatePaperRequest,
  type UpdatePaperRequest,
  type QueryPapersParams,
  type SubmitAnswerRequest,
  type UpdateScoreRequest,
  type QueryAnswersParams,
  type AnswerStats,
  type ReportWithPaper,
  type QueryReportsParams,
  type GenerateQuestionsRequest,
  type AnalyzeAnswerRequest,
  type AnalysisResult,
} from './endpoints';

// QuizFlow API - 组合的 API 客户端
export { QuizFlowApi, createQuizFlowApi, type QuizFlowApiConfig } from './quizflow-api';
