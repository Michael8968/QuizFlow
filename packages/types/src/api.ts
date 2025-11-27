/**
 * API 错误信息
 */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp?: string;
  path?: string;
}

/**
 * 分页元数据
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * 搜索参数
 */
export interface SearchParams extends PaginationParams {
  search?: string;
}

/**
 * 题目搜索参数
 */
export interface QuestionSearchParams extends SearchParams {
  tags?: string[];
  difficulty?: string;
  type?: string;
}
