# QuizFlow 架构重构详细方案

## 目录

1. [重构概览](#重构概览)
2. [阶段一：共享包抽取](#阶段一共享包抽取)
3. [阶段二：后端分层重构](#阶段二后端分层重构)
4. [阶段三：前端 API 客户端重构](#阶段三前端-api-客户端重构)
5. [阶段四：异常处理统一](#阶段四异常处理统一)
6. [阶段五：测试框架搭建](#阶段五测试框架搭建)
7. [阶段六：H5 离线支持](#阶段六h5-离线支持)

---

## 重构概览

### 当前问题总结

| 问题 | 影响范围 | 优先级 |
|------|----------|--------|
| 类型定义重复 (web/h5-quiz 各自定义) | 维护成本高、类型不一致 | P0 |
| SupabaseService 承载过重 (302 行) | 难以测试、职责不清 | P0 |
| 缺少 DTO (仅 2 个模块有) | 类型不安全、API 文档不完整 | P0 |
| API 客户端无拦截器 | 错误处理不统一、无自动续期 | P1 |
| 无全局异常处理 | 错误响应格式不一致 | P1 |
| 测试覆盖为零 | 代码质量无保障 | P1 |
| H5 无离线支持 | 断网无法答题 | P2 |

### 目标架构

```
quizflow/
├── apps/
│   ├── api/                    # NestJS 后端
│   │   └── src/
│   │       ├── modules/        # 业务模块
│   │       │   └── [module]/
│   │       │       ├── [module].controller.ts
│   │       │       ├── [module].service.ts
│   │       │       ├── [module].repository.ts  ← 新增
│   │       │       └── dto/
│   │       ├── common/
│   │       │   ├── filters/    ← 新增
│   │       │   ├── interceptors/
│   │       │   └── decorators/
│   │       └── database/       ← 新增
│   │           └── supabase.client.ts
│   ├── web/
│   └── h5-quiz/
├── packages/                   ← 新增
│   ├── types/                  # 共享类型
│   ├── utils/                  # 共享工具
│   ├── validators/             # Zod schemas
│   └── api-client/             # 统一 API 客户端
└── tests/                      ← 新增
    └── e2e/
```

---

## 阶段一：共享包抽取

### 1.1 创建 packages/types

**目标**：统一 `web` 和 `h5-quiz` 的类型定义，消除重复

**当前问题**：
- `apps/web/src/types/index.ts` 定义了 `Question`, `Paper`, `Answer` 等
- `apps/h5-quiz/src/types/index.ts` 重复定义，且命名不一致 (`Paper` vs `Quiz`)

**目录结构**：
```
packages/types/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # 导出所有类型
│   ├── user.ts
│   ├── question.ts
│   ├── paper.ts
│   ├── answer.ts
│   ├── report.ts
│   ├── subscription.ts
│   └── api.ts             # API 响应/请求类型
└── README.md
```

**packages/types/package.json**：
```json
{
  "name": "@quizflow/types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**packages/types/src/question.ts**：
```typescript
/**
 * 题目类型枚举
 */
export type QuestionType = 'single' | 'multiple' | 'fill' | 'essay';

/**
 * 难度等级
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * 题目基础接口
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
 * 完整题目（包含数据库字段）
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
 * H5 答卷中的题目（不包含答案）
 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  points: number;
  order: number;
  // 注意：不包含 answer 和 explanation
}
```

**packages/types/src/paper.ts**：
```typescript
import type { Question, QuizQuestion } from './question';

/**
 * 试卷状态
 */
export type PaperStatus = 'draft' | 'published' | 'archived';

/**
 * 试卷设置
 */
export interface PaperSettings {
  time_limit?: number;          // 答题时间限制（分钟）
  shuffle_questions: boolean;    // 是否打乱题目顺序
  shuffle_options: boolean;      // 是否打乱选项顺序
  show_correct_answer: boolean;  // 提交后是否显示正确答案
  allow_review: boolean;         // 是否允许回顾答题
}

/**
 * 试卷基础接口
 */
export interface PaperBase {
  title: string;
  description?: string;
  settings: PaperSettings;
}

/**
 * 完整试卷（教师端）
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
```

**packages/types/src/api.ts**：
```typescript
/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API 错误格式
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 分页元数据
 */
export interface ApiMeta {
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
  meta: ApiMeta;
}
```

### 1.2 创建 packages/utils

**目标**：抽取通用工具函数，消除重复

**目录结构**：
```
packages/utils/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── cn.ts              # className 合并
│   ├── format.ts          # 格式化函数
│   ├── validation.ts      # 验证工具
│   └── quiz.ts            # 答卷相关工具
└── README.md
```

**packages/utils/src/cn.ts**：
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**packages/utils/src/format.ts**：
```typescript
/**
 * 格式化日期
 */
export function formatDate(date: string | Date, locale = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date, locale = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化分数
 */
export function formatScore(score: number, total: number): string {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  return `${score}/${total} (${percentage.toFixed(1)}%)`;
}

/**
 * 格式化时长（秒 -> 分:秒）
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 获取难度颜色
 */
export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  const colors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100',
  };
  return colors[difficulty];
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-gray-600 bg-gray-100',
    published: 'text-green-600 bg-green-100',
    archived: 'text-yellow-600 bg-yellow-100',
    completed: 'text-blue-600 bg-blue-100',
    in_progress: 'text-orange-600 bg-orange-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}
```

### 1.3 创建 packages/validators

**目标**：共享 Zod schema，前后端复用验证逻辑

**packages/validators/src/question.ts**：
```typescript
import { z } from 'zod';

export const questionTypeSchema = z.enum(['single', 'multiple', 'fill', 'essay']);
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const createQuestionSchema = z.object({
  type: questionTypeSchema,
  content: z.string().min(1, '题目内容不能为空').max(5000),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  difficulty: difficultySchema.default('medium'),
  points: z.number().min(0).max(100).default(1),
}).refine(
  (data) => {
    // 单选题和多选题必须有选项
    if (['single', 'multiple'].includes(data.type)) {
      return data.options && data.options.length >= 2;
    }
    return true;
  },
  { message: '选择题至少需要 2 个选项' }
);

export const updateQuestionSchema = createQuestionSchema.partial();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
```

### 1.4 更新 apps 引用共享包

**apps/web/package.json** 添加依赖：
```json
{
  "dependencies": {
    "@quizflow/types": "workspace:*",
    "@quizflow/utils": "workspace:*",
    "@quizflow/validators": "workspace:*"
  }
}
```

**迁移步骤**：
1. 删除 `apps/web/src/types/index.ts`
2. 删除 `apps/h5-quiz/src/types/index.ts`
3. 更新所有 import 路径：
   ```typescript
   // Before
   import type { Question, Paper } from '@/types';

   // After
   import type { Question, Paper } from '@quizflow/types';
   ```

---

## 阶段二：后端分层重构

### 2.1 引入 Repository 模式

**当前问题**：
`SupabaseService` 包含所有表的 CRUD 操作（302 行），混杂了数据访问和部分业务逻辑。

**目标架构**：
```
Controller → Service → Repository → Supabase Client
     ↓           ↓           ↓
  HTTP处理    业务逻辑    数据访问
```

**创建 BaseRepository**：

```typescript
// apps/api/src/database/base.repository.ts
import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly tableName: string,
  ) {}

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findMany(options?: {
    where?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*');

    if (options?.where) {
      for (const [key, value] of Object.entries(options.where)) {
        query = query.eq(key, value);
      }
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async create(entity: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(entity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(entity)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
```

**创建 QuestionRepository**：

```typescript
// apps/api/src/questions/question.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../database/base.repository';
import { SupabaseService } from '../common/supabase.service';
import type { Question } from '@quizflow/types';

export interface FindQuestionsOptions {
  userId: string;
  search?: string;
  tags?: string[];
  difficulty?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class QuestionRepository extends BaseRepository<Question> {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService.getClient(), 'questions');
  }

  async findByUserId(options: FindQuestionsOptions): Promise<{
    data: Question[];
    total: number;
  }> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false });

    // 搜索
    if (options.search) {
      query = query.or(
        `content.ilike.%${options.search}%,tags.cs.{${options.search}}`
      );
    }

    // 标签过滤
    if (options.tags?.length) {
      query = query.contains('tags', options.tags);
    }

    // 难度过滤
    if (options.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }

    // 分页
    if (options.page && options.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findByIds(ids: string[]): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  }
}
```

**重构 QuestionService**：

```typescript
// apps/api/src/questions/questions.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuestionRepository, FindQuestionsOptions } from './question.repository';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import type { Question, PaginatedResponse } from '@quizflow/types';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async findAll(
    userId: string,
    options?: Omit<FindQuestionsOptions, 'userId'>
  ): Promise<PaginatedResponse<Question>> {
    const { data, total } = await this.questionRepository.findByUserId({
      userId,
      ...options,
    });

    const page = options?.page || 1;
    const limit = options?.limit || 20;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Question> {
    const question = await this.questionRepository.findById(id);

    if (!question) {
      throw new NotFoundException(`题目不存在: ${id}`);
    }

    if (question.user_id !== userId) {
      throw new ForbiddenException('无权访问此题目');
    }

    return question;
  }

  async create(userId: string, dto: CreateQuestionDto): Promise<Question> {
    // 业务逻辑验证
    this.validateQuestionData(dto);

    return this.questionRepository.create({
      ...dto,
      user_id: userId,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateQuestionDto
  ): Promise<Question> {
    // 先验证权限
    await this.findOne(id, userId);

    if (Object.keys(dto).length > 0) {
      this.validateQuestionData(dto);
    }

    return this.questionRepository.update(id, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    // 先验证权限
    await this.findOne(id, userId);
    await this.questionRepository.delete(id);
  }

  /**
   * 验证题目数据的业务规则
   */
  private validateQuestionData(dto: Partial<CreateQuestionDto>): void {
    // 选择题必须有选项
    if (dto.type && ['single', 'multiple'].includes(dto.type)) {
      if (!dto.options || dto.options.length < 2) {
        throw new Error('选择题至少需要 2 个选项');
      }
    }

    // 多选题答案必须是数组
    if (dto.type === 'multiple' && dto.answer) {
      if (!Array.isArray(dto.answer)) {
        throw new Error('多选题答案必须是数组');
      }
    }
  }
}
```

### 2.2 简化 SupabaseService

重构后的 `SupabaseService` 只负责提供 Supabase 客户端：

```typescript
// apps/api/src/database/supabase.client.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.getOrThrow('SUPABASE_URL');
    const key = this.configService.getOrThrow('SUPABASE_SERVICE_ROLE_KEY');

    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
```

### 2.3 补全所有模块的 DTO

**papers/dto/paper.dto.ts**：
```typescript
import { IsString, IsOptional, IsEnum, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PaperSettingsDto {
  @ApiPropertyOptional({ description: '答题时间限制（分钟）' })
  @IsOptional()
  time_limit?: number;

  @ApiProperty({ description: '是否打乱题目顺序' })
  shuffle_questions: boolean;

  @ApiProperty({ description: '是否打乱选项顺序' })
  shuffle_options: boolean;

  @ApiProperty({ description: '提交后是否显示正确答案' })
  show_correct_answer: boolean;

  @ApiProperty({ description: '是否允许回顾答题' })
  allow_review: boolean;
}

export class CreatePaperDto {
  @ApiProperty({ description: '试卷标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '试卷描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '题目 ID 列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  question_ids: string[];

  @ApiProperty({ description: '试卷设置' })
  @ValidateNested()
  @Type(() => PaperSettingsDto)
  @IsObject()
  settings: PaperSettingsDto;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';
}

export class UpdatePaperDto {
  @ApiPropertyOptional({ description: '试卷标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '试卷描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '题目 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  question_ids?: string[];

  @ApiPropertyOptional({ description: '试卷设置' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaperSettingsDto)
  @IsObject()
  settings?: PaperSettingsDto;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';
}
```

**answers/dto/answer.dto.ts**：
```typescript
import { IsString, IsOptional, IsEmail, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: '试卷考试码' })
  @IsString()
  quiz_code: string;

  @ApiPropertyOptional({ description: '学生姓名' })
  @IsOptional()
  @IsString()
  student_name?: string;

  @ApiPropertyOptional({ description: '学生邮箱' })
  @IsOptional()
  @IsEmail()
  student_email?: string;

  @ApiProperty({ description: '答题响应', example: { 'q1': 'A', 'q2': ['B', 'C'] } })
  @IsObject()
  responses: Record<string, string | string[]>;

  @ApiProperty({ description: '答题耗时（秒）' })
  time_spent: number;
}
```

---

## 阶段三：前端 API 客户端重构

### 3.1 创建 packages/api-client

**目标**：统一的 API 客户端，支持拦截器、自动续期、错误处理

**目录结构**：
```
packages/api-client/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── client.ts           # 核心客户端
│   ├── interceptors/
│   │   ├── auth.ts         # 认证拦截器
│   │   ├── error.ts        # 错误拦截器
│   │   └── retry.ts        # 重试拦截器
│   ├── endpoints/
│   │   ├── auth.ts
│   │   ├── questions.ts
│   │   ├── papers.ts
│   │   └── answers.ts
│   └── types.ts
└── README.md
```

**packages/api-client/src/client.ts**：
```typescript
import type { ApiResponse, ApiError } from '@quizflow/types';

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

export interface Interceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: ApiError) => ApiError | Promise<ApiError>;
}

export class ApiClient {
  private baseUrl: string;
  private interceptors: Interceptor[] = [];
  private tokenGetter: (() => string | null) | null = null;
  private tokenRefresher: (() => Promise<string | null>) | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 配置 Token 获取方式
   */
  setTokenGetter(getter: () => string | null): this {
    this.tokenGetter = getter;
    return this;
  }

  /**
   * 配置 Token 刷新方式
   */
  setTokenRefresher(refresher: () => Promise<string | null>): this {
    this.tokenRefresher = refresher;
    return this;
  }

  /**
   * 配置未授权回调
   */
  setOnUnauthorized(callback: () => void): this {
    this.onUnauthorized = callback;
    return this;
  }

  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: Interceptor): this {
    this.interceptors.push(interceptor);
    return this;
  }

  /**
   * 发送请求
   */
  async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    // 构建请求配置
    let config: RequestConfig = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    // 添加认证 Token
    const token = this.tokenGetter?.();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // 执行请求拦截器
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        config = await interceptor.onRequest(config);
      }
    }

    // 发送请求
    const controller = new AbortController();
    const timeout = config.timeout || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理 401 未授权
      if (response.status === 401) {
        // 尝试刷新 Token
        if (this.tokenRefresher) {
          const newToken = await this.tokenRefresher();
          if (newToken) {
            // 重试请求
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, config);
            return this.handleResponse<T>(retryResponse);
          }
        }

        // Token 刷新失败，调用未授权回调
        this.onUnauthorized?.();
        throw new Error('未授权：请重新登录');
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时');
      }

      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorData: ApiError;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          code: `HTTP_${response.status}`,
          message: errorText || response.statusText,
        };
      }

      // 执行错误拦截器
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          errorData = await interceptor.onError(errorData);
        }
      }

      throw errorData;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    let data: ApiResponse<T>;
    try {
      data = JSON.parse(text);
    } catch {
      return {} as T;
    }

    // 执行响应拦截器
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        data = await interceptor.onResponse(data);
      }
    }

    return (data.data ?? data) as T;
  }

  // HTTP 方法快捷方式
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}
```

**packages/api-client/src/endpoints/questions.ts**：
```typescript
import type { ApiClient } from '../client';
import type {
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  PaginatedResponse,
  PaginationParams,
} from '@quizflow/types';

export interface QuestionSearchParams extends PaginationParams {
  search?: string;
  tags?: string[];
  difficulty?: string;
}

export function createQuestionsApi(client: ApiClient) {
  return {
    /**
     * 获取题目列表
     */
    list(params?: QuestionSearchParams): Promise<PaginatedResponse<Question>> {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));

      const query = searchParams.toString();
      return client.get(`/questions${query ? `?${query}` : ''}`);
    },

    /**
     * 获取单个题目
     */
    get(id: string): Promise<Question> {
      return client.get(`/questions/${id}`);
    },

    /**
     * 创建题目
     */
    create(data: CreateQuestionDto): Promise<Question> {
      return client.post('/questions', data);
    },

    /**
     * 更新题目
     */
    update(id: string, data: UpdateQuestionDto): Promise<Question> {
      return client.patch(`/questions/${id}`, data);
    },

    /**
     * 删除题目
     */
    delete(id: string): Promise<void> {
      return client.delete(`/questions/${id}`);
    },
  };
}
```

**在 apps/web 中使用**：
```typescript
// apps/web/src/lib/api.ts
import { ApiClient } from '@quizflow/api-client';
import { createQuestionsApi } from '@quizflow/api-client/endpoints/questions';
import { createPapersApi } from '@quizflow/api-client/endpoints/papers';
import { createAuthApi } from '@quizflow/api-client/endpoints/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 创建客户端实例
const client = new ApiClient(apiUrl)
  .setTokenGetter(() => {
    try {
      const storage = localStorage.getItem('auth-storage');
      return storage ? JSON.parse(storage).state?.token : null;
    } catch {
      return null;
    }
  })
  .setTokenRefresher(async () => {
    try {
      const storage = localStorage.getItem('auth-storage');
      const refreshToken = storage ? JSON.parse(storage).state?.refreshToken : null;
      if (!refreshToken) return null;

      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      // 更新存储的 token
      const currentStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      currentStorage.state.token = data.access_token;
      localStorage.setItem('auth-storage', JSON.stringify(currentStorage));

      return data.access_token;
    } catch {
      return null;
    }
  })
  .setOnUnauthorized(() => {
    localStorage.removeItem('auth-storage');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  });

// 导出 API 模块
export const api = {
  auth: createAuthApi(client),
  questions: createQuestionsApi(client),
  papers: createPapersApi(client),
  answers: createAnswersApi(client),
  reports: createReportsApi(client),
  ai: createAiApi(client),
};
```

---

## 阶段四：异常处理统一

### 4.1 创建全局异常过滤器

```typescript
// apps/api/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import type { ApiError } from '@quizflow/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiError;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorResponse = {
          code: `HTTP_${status}`,
          message: exceptionResponse,
        };
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        errorResponse = {
          code: (resp.code as string) || `HTTP_${status}`,
          message: (resp.message as string) || exception.message,
          details: resp.details as Record<string, unknown>,
        };
      } else {
        errorResponse = {
          code: `HTTP_${status}`,
          message: exception.message,
        };
      }
    } else if (exception instanceof Error) {
      // 数据库错误
      if (exception.message?.includes('duplicate key')) {
        status = HttpStatus.CONFLICT;
        errorResponse = {
          code: 'DUPLICATE_ENTRY',
          message: '记录已存在',
        };
      } else if (exception.message?.includes('foreign key')) {
        status = HttpStatus.BAD_REQUEST;
        errorResponse = {
          code: 'FOREIGN_KEY_VIOLATION',
          message: '关联数据不存在',
        };
      } else {
        errorResponse = {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        };
      }

      // 记录详细错误日志
      this.logger.error(
        `${request.method} ${request.url} - ${exception.message}`,
        exception.stack,
      );
    } else {
      errorResponse = {
        code: 'UNKNOWN_ERROR',
        message: '未知错误',
      };
      this.logger.error('Unknown error', exception);
    }

    response.status(status).json({
      success: false,
      error: errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 4.2 创建业务异常类

```typescript
// apps/api/src/common/exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(code: string, message: string, status = HttpStatus.BAD_REQUEST) {
    super({ code, message }, status);
  }
}

// 常用业务异常
export class QuotaExceededException extends BusinessException {
  constructor(resource: string) {
    super('QUOTA_EXCEEDED', `${resource}配额已用完，请升级套餐`);
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource}不存在: ${id}`, HttpStatus.NOT_FOUND);
  }
}

export class PermissionDeniedException extends BusinessException {
  constructor(action: string) {
    super('PERMISSION_DENIED', `无权执行操作: ${action}`, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST);
  }
}
```

### 4.3 注册全局过滤器

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ... 其他配置
}
```

---

## 阶段五：测试框架搭建

### 5.1 后端测试配置

**apps/api/jest.config.js**：
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@quizflow/types$': '<rootDir>/../../packages/types/src',
    '^@quizflow/validators$': '<rootDir>/../../packages/validators/src',
  },
};
```

### 5.2 示例单元测试

```typescript
// apps/api/src/questions/questions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './question.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let repository: jest.Mocked<QuestionRepository>;

  const mockQuestion = {
    id: 'q1',
    user_id: 'user1',
    type: 'single',
    content: '1+1=?',
    options: ['1', '2', '3', '4'],
    answer: '2',
    tags: ['math'],
    difficulty: 'easy',
    points: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: QuestionRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    repository = module.get(QuestionRepository);
  });

  describe('findOne', () => {
    it('应该返回用户的题目', async () => {
      repository.findById.mockResolvedValue(mockQuestion);

      const result = await service.findOne('q1', 'user1');

      expect(result).toEqual(mockQuestion);
      expect(repository.findById).toHaveBeenCalledWith('q1');
    });

    it('题目不存在时应该抛出 NotFoundException', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('q1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('无权访问时应该抛出 ForbiddenException', async () => {
      repository.findById.mockResolvedValue(mockQuestion);

      await expect(service.findOne('q1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('应该创建单选题', async () => {
      const dto = {
        type: 'single' as const,
        content: '1+1=?',
        options: ['1', '2', '3', '4'],
        answer: '2',
        tags: ['math'],
        difficulty: 'easy' as const,
        points: 1,
      };

      repository.create.mockResolvedValue({ ...mockQuestion, ...dto });

      const result = await service.create('user1', dto);

      expect(result.content).toBe(dto.content);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        user_id: 'user1',
      });
    });

    it('选择题没有选项时应该抛出错误', async () => {
      const dto = {
        type: 'single' as const,
        content: '1+1=?',
        options: [], // 空选项
        answer: '2',
        tags: [],
        difficulty: 'easy' as const,
        points: 1,
      };

      await expect(service.create('user1', dto)).rejects.toThrow();
    });
  });
});
```

### 5.3 E2E 测试

```typescript
// tests/e2e/questions.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';

describe('Questions API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // 获取测试用户的 token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/questions', () => {
    it('未授权时应该返回 401', () => {
      return request(app.getHttpServer())
        .get('/api/questions')
        .expect(401);
    });

    it('授权后应该返回题目列表', () => {
      return request(app.getHttpServer())
        .get('/api/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('POST /api/questions', () => {
    it('应该创建新题目', () => {
      return request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'single',
          content: 'E2E 测试题目',
          options: ['A', 'B', 'C', 'D'],
          answer: 'A',
          tags: ['test'],
          difficulty: 'easy',
          points: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.content).toBe('E2E 测试题目');
          expect(res.body.id).toBeDefined();
        });
    });

    it('缺少必填字段时应该返回 400', () => {
      return request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '只有内容' })
        .expect(400);
    });
  });
});
```

### 5.4 前端测试配置

**apps/web/vitest.config.ts**：
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@quizflow/types': path.resolve(__dirname, '../../packages/types/src'),
      '@quizflow/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});
```

---

## 阶段六：H5 离线支持

### 6.1 IndexedDB 存储层

```typescript
// apps/h5-quiz/src/lib/offline-storage.ts
import { openDB, IDBPDatabase } from 'idb';
import type { Quiz, Answer } from '@quizflow/types';

const DB_NAME = 'quizflow-offline';
const DB_VERSION = 1;

interface QuizFlowDB {
  quizzes: Quiz;
  answers: Answer;
  pendingSubmissions: {
    id: string;
    answer: Omit<Answer, 'id'>;
    createdAt: number;
  };
}

class OfflineStorage {
  private db: IDBPDatabase<QuizFlowDB> | null = null;

  async init(): Promise<void> {
    this.db = await openDB<QuizFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 试卷缓存
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }

        // 答卷缓存
        if (!db.objectStoreNames.contains('answers')) {
          db.createObjectStore('answers', { keyPath: 'id' });
        }

        // 待提交的答卷
        if (!db.objectStoreNames.contains('pendingSubmissions')) {
          const store = db.createObjectStore('pendingSubmissions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }

  /**
   * 缓存试卷
   */
  async cacheQuiz(quiz: Quiz): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('quizzes', quiz);
  }

  /**
   * 获取缓存的试卷
   */
  async getCachedQuiz(id: string): Promise<Quiz | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('quizzes', id);
  }

  /**
   * 保存答卷进度
   */
  async saveAnswerProgress(answer: Partial<Answer>): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('answers', answer as Answer);
  }

  /**
   * 获取答卷进度
   */
  async getAnswerProgress(quizId: string): Promise<Answer | undefined> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('answers', 'readonly');
    const store = tx.objectStore('answers');
    const all = await store.getAll();
    return all.find(a => a.quiz_id === quizId && a.status === 'in_progress');
  }

  /**
   * 添加待提交的答卷
   */
  async addPendingSubmission(answer: Omit<Answer, 'id'>): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.add('pendingSubmissions', {
      id: crypto.randomUUID(),
      answer,
      createdAt: Date.now(),
    });
  }

  /**
   * 获取所有待提交的答卷
   */
  async getPendingSubmissions(): Promise<Array<{ id: string; answer: Omit<Answer, 'id'> }>> {
    if (!this.db) await this.init();
    return this.db!.getAll('pendingSubmissions');
  }

  /**
   * 删除已提交的答卷
   */
  async removePendingSubmission(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('pendingSubmissions', id);
  }
}

export const offlineStorage = new OfflineStorage();
```

### 6.2 离线同步服务

```typescript
// apps/h5-quiz/src/lib/sync-service.ts
import { offlineStorage } from './offline-storage';
import { api } from './api';

class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingSubmissions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 应用启动时尝试同步
    if (this.isOnline) {
      this.syncPendingSubmissions();
    }
  }

  /**
   * 提交答卷（支持离线）
   */
  async submitAnswer(answer: Omit<Answer, 'id'>): Promise<{ success: boolean; offline?: boolean }> {
    if (this.isOnline) {
      try {
        await api.answers.submit(answer);
        return { success: true };
      } catch (error) {
        // 网络请求失败，保存到本地
        await offlineStorage.addPendingSubmission(answer);
        return { success: true, offline: true };
      }
    } else {
      // 离线状态，保存到本地
      await offlineStorage.addPendingSubmission(answer);
      return { success: true, offline: true };
    }
  }

  /**
   * 同步待提交的答卷
   */
  async syncPendingSubmissions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const pending = await offlineStorage.getPendingSubmissions();

      for (const item of pending) {
        try {
          await api.answers.submit(item.answer);
          await offlineStorage.removePendingSubmission(item.id);
        } catch (error) {
          console.error('同步答卷失败:', error);
          // 继续处理下一个
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 获取待同步数量
   */
  async getPendingCount(): Promise<number> {
    const pending = await offlineStorage.getPendingSubmissions();
    return pending.length;
  }
}

export const syncService = new SyncService();
```

---

## 实施顺序建议

| 阶段 | 预计工作量 | 依赖关系 |
|------|-----------|----------|
| 阶段一：共享包抽取 | 2-3 天 | 无 |
| 阶段二：后端分层重构 | 3-4 天 | 阶段一 |
| 阶段三：前端 API 客户端重构 | 2 天 | 阶段一 |
| 阶段四：异常处理统一 | 1 天 | 阶段二 |
| 阶段五：测试框架搭建 | 2-3 天 | 阶段二、三 |
| 阶段六：H5 离线支持 | 2 天 | 阶段一、三 |

**总计：约 12-15 天**

建议按顺序实施，每个阶段完成后进行集成测试，确保系统稳定。
