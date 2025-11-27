import { ApiClient, type ApiClientConfig } from './client';
import { AuthEndpoint } from './endpoints/auth.endpoint';
import { QuestionsEndpoint } from './endpoints/questions.endpoint';
import { PapersEndpoint } from './endpoints/papers.endpoint';
import { AnswersEndpoint } from './endpoints/answers.endpoint';
import { ReportsEndpoint } from './endpoints/reports.endpoint';
import { AiEndpoint } from './endpoints/ai.endpoint';

/**
 * QuizFlow API 配置
 */
export interface QuizFlowApiConfig extends Omit<ApiClientConfig, 'baseUrl'> {
  baseUrl?: string;
}

/**
 * QuizFlow API 客户端
 * 组合所有 endpoints，提供统一的 API 访问接口
 */
export class QuizFlowApi {
  private client: ApiClient;

  /** 认证相关 API */
  readonly auth: AuthEndpoint;

  /** 题目相关 API */
  readonly questions: QuestionsEndpoint;

  /** 试卷相关 API */
  readonly papers: PapersEndpoint;

  /** 答卷相关 API */
  readonly answers: AnswersEndpoint;

  /** 报告相关 API */
  readonly reports: ReportsEndpoint;

  /** AI 相关 API */
  readonly ai: AiEndpoint;

  constructor(config: QuizFlowApiConfig = {}) {
    const baseUrl = config.baseUrl ?? this.getDefaultBaseUrl();

    this.client = new ApiClient({
      ...config,
      baseUrl,
    });

    // 初始化各个 endpoint
    this.auth = new AuthEndpoint(this.client);
    this.questions = new QuestionsEndpoint(this.client);
    this.papers = new PapersEndpoint(this.client);
    this.answers = new AnswersEndpoint(this.client);
    this.reports = new ReportsEndpoint(this.client);
    this.ai = new AiEndpoint(this.client);
  }

  /**
   * 获取默认 API 地址
   */
  private getDefaultBaseUrl(): string {
    // 浏览器环境
    if (typeof window !== 'undefined') {
      // 检查环境变量
      const envUrl = (window as unknown as { __ENV__?: { API_URL?: string } }).__ENV__?.API_URL;
      if (envUrl) {
        return envUrl;
      }

      // 开发环境默认地址
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:3000/api';
      }

      // 生产环境使用相同域名
      return `${window.location.origin}/api`;
    }

    // Node.js 环境
    return process.env.API_URL ?? 'http://localhost:3000/api';
  }

  /**
   * 获取底层 ApiClient 实例
   */
  getClient(): ApiClient {
    return this.client;
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(
    interceptor: Parameters<ApiClient['addRequestInterceptor']>[0]
  ): ReturnType<ApiClient['addRequestInterceptor']> {
    return this.client.addRequestInterceptor(interceptor);
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(
    interceptor: Parameters<ApiClient['addResponseInterceptor']>[0]
  ): ReturnType<ApiClient['addResponseInterceptor']> {
    return this.client.addResponseInterceptor(interceptor);
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(
    interceptor: Parameters<ApiClient['addErrorInterceptor']>[0]
  ): ReturnType<ApiClient['addErrorInterceptor']> {
    return this.client.addErrorInterceptor(interceptor);
  }
}

/**
 * 创建 QuizFlow API 实例
 */
export function createQuizFlowApi(config?: QuizFlowApiConfig): QuizFlowApi {
  return new QuizFlowApi(config);
}

/**
 * 默认 API 实例（惰性初始化）
 */
let defaultApiInstance: QuizFlowApi | null = null;

/**
 * 获取默认 API 实例
 */
export function getQuizFlowApi(): QuizFlowApi {
  if (!defaultApiInstance) {
    defaultApiInstance = createQuizFlowApi();
  }
  return defaultApiInstance;
}

/**
 * 设置默认 API 实例
 */
export function setQuizFlowApi(api: QuizFlowApi): void {
  defaultApiInstance = api;
}
