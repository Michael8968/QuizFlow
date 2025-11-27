# Project Context

## Purpose

QuizFlow 是一个基于 AI 的智能题库和在线答卷 SaaS 平台，为教育机构和教师提供：
- AI 自动出题，节省 80% 出卷时间
- H5 答卷自动适配手机/平板
- 自动统计与分析，生成成绩报告
- SaaS 模式，教师 & 学生即开即用

**目标用户**：教培机构、学校老师、自媒体讲师、学生

## Tech Stack

### 前端
- **框架**: React 18 + Vite + TypeScript 5
- **UI 组件**: shadcn/ui (Radix UI) + Tailwind CSS 3
- **状态管理**: Zustand
- **数据请求**: TanStack Query (React Query)
- **表单处理**: React Hook Form + Zod
- **图表**: Recharts
- **路由**: React Router DOM

### 后端
- **框架**: NestJS 10
- **数据库**: PostgreSQL (Supabase 托管)
- **认证**: Supabase Auth + Passport JWT
- **AI 功能**: OpenAI API
- **支付**: Stripe
- **文件处理**: Multer, xlsx, csv-parser
- **PDF 导出**: Puppeteer + Handlebars

### 部署
- **前端**: Vercel
- **后端**: Render / 腾讯云 CloudBase
- **CDN**: Cloudflare

### 工具链
- **包管理**: Yarn Workspaces (monorepo)
- **Node 版本**: >=20.0.0
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript strict mode

## Project Conventions

### Code Style
- 使用 TypeScript strict mode
- 组件使用函数式组件 + Hooks
- 使用 `kebab-case` 命名文件，`PascalCase` 命名组件
- API 路由使用 RESTful 风格
- 使用 Zod 进行运行时类型验证

### Architecture Patterns

**前端架构**:
```
apps/[app]/src/
├── components/     # UI 组件
│   ├── ui/        # 基础 UI 组件 (shadcn/ui)
│   └── [feature]/ # 业务组件
├── pages/         # 页面组件
├── hooks/         # 自定义 Hooks
├── stores/        # Zustand 状态管理
├── lib/           # 工具函数和 API 客户端
└── types/         # TypeScript 类型定义
```

**后端架构** (NestJS 模块化):
```
apps/api/src/
├── [module]/
│   ├── [module].controller.ts  # HTTP 路由处理
│   ├── [module].service.ts     # 业务逻辑
│   ├── [module].module.ts      # 模块定义
│   └── dto/                    # 数据传输对象
└── common/                     # 共享服务
```

### Testing Strategy
- 后端: Jest 单元测试 + E2E 测试
- 前端: 暂未配置（待添加 Vitest）
- API 测试: Supertest

### Git Workflow
- 主分支: `main`
- 功能分支: `feature/[feature-name]`
- 修复分支: `fix/[bug-name]`
- Commit message: 使用简体中文，控制在 200 字符以内

## Domain Context

### 核心概念
- **题目 (Question)**: 单个题目，包含题干、选项、答案、标签
- **试卷 (Paper)**: 由多个题目组成的测试卷
- **答卷 (Answer)**: 学生对试卷的作答记录
- **报告 (Report)**: 成绩分析报告，包含图表和统计数据
- **订阅 (Subscription)**: 用户的付费套餐

### 用户角色
- **教师/管理员**: 创建题库、组卷、查看报告
- **学生**: 通过 H5 答卷页面答题

### 订阅套餐
| 套餐 | 月费 | 功能 |
|------|------|------|
| 免费版 | ¥0 | 100题，1套试卷 |
| 专业版 | ¥49 | 无限题库 + 智能组卷 |
| 机构版 | ¥199 | 多教师协作 + 班级管理 |
| AI 增强版 | ¥299 | AI 出题 + AI 解析 |

## Important Constraints

- 后端 API 需要支持 Supabase Row Level Security (RLS)
- H5 答卷页需要独立部署，支持 iframe 嵌入
- AI 出题功能依赖 OpenAI API，需要处理配额限制
- PDF 导出依赖 Puppeteer，需要处理 Chromium 下载问题
- 移动端答卷需要支持断网续答（IndexedDB 缓存）

## External Dependencies

### 第三方服务
- **Supabase**: 数据库 + 认证 + 文件存储
- **OpenAI API**: AI 出题和智能解析
- **Stripe**: 支付订阅处理
- **Vercel**: 前端托管和 CI/CD

### 环境变量
参考 `env.example` 配置：
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`

## Apps Overview

| 应用 | 路径 | 用途 | 端口 |
|------|------|------|------|
| web | `apps/web/` | 教师端管理后台 | 5173 |
| h5-quiz | `apps/h5-quiz/` | 学生 H5 答卷 | 5174 |
| api | `apps/api/` | 后端 API 服务 | 3000 |
| website | `apps/website/` | 产品官网 | 5175 |
