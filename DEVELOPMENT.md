# QuizFlow 开发指南

## 🚀 快速开始

### 环境要求
- Node.js 20+
- Yarn 1.22+
- Git

### 安装依赖
```bash
# 安装所有依赖（包括子项目）
yarn install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp env.example .env
```

2. 配置 Supabase：
   - 创建 Supabase 项目
   - 获取项目 URL 和 API 密钥
   - 更新 `.env` 文件中的 Supabase 配置

3. 配置 AI 服务（可选）：
   - 获取 DeepSeek API 密钥
   - 更新 `.env` 文件中的 OPENAI_API_KEY（使用 DeepSeek 端点）

4. 配置 Stripe（可选）：
   - 获取 Stripe API 密钥
   - 更新 `.env` 文件中的 Stripe 配置

### 启动开发环境
```bash
# 启动所有服务
yarn dev

# 或分别启动
yarn dev:web      # 教师端 (http://localhost:3000)
yarn dev:h5       # H5 答卷 (http://localhost:3002)
yarn dev:api      # 后端 API (http://localhost:3001)
yarn dev:website  # 官网 (http://localhost:3003)
```

## 📁 项目结构

```
QuizFlow/
├── apps/
│   ├── web/                 # 教师端 Web 应用 (React + Vite)
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── pages/       # 页面组件（懒加载）
│   │   │   ├── hooks/       # 自定义 Hooks
│   │   │   ├── stores/      # Zustand 状态管理
│   │   │   ├── lib/         # 工具函数
│   │   │   └── types/       # 类型定义
│   │   └── package.json
│   ├── h5-quiz/            # H5 答卷应用 (React + Vite)
│   │   ├── src/
│   │   │   ├── components/  # 答卷组件
│   │   │   ├── pages/       # 答卷页面
│   │   │   ├── stores/      # 答卷状态
│   │   │   └── types/       # 答卷类型
│   │   └── package.json
│   ├── api/                # NestJS 后端 API
│   │   ├── src/
│   │   │   ├── auth/        # 认证模块（JWT + Passport）
│   │   │   ├── questions/   # 题目管理
│   │   │   ├── papers/      # 试卷管理
│   │   │   ├── answers/     # 答卷管理
│   │   │   ├── reports/     # 报告管理
│   │   │   ├── ai/          # AI 生成题目（DeepSeek）
│   │   │   ├── subscriptions/ # 订阅管理（Stripe）
│   │   │   ├── feedback/    # 用户反馈
│   │   │   └── common/      # 公共模块
│   │   └── package.json
│   └── website/            # 官网/落地页
│       └── package.json
├── packages/
│   ├── types/              # 共享类型定义
│   ├── api-client/         # API 客户端封装
│   ├── i18n/               # 国际化配置
│   ├── utils/              # 工具函数
│   └── validators/         # 共享校验规则（Zod）
├── database/
│   ├── schema.sql          # 数据库结构
│   └── README.md           # 数据库配置说明
├── docs/                   # 项目文档
└── package.json           # 根目录配置（Yarn Workspaces）
```

## 🛠️ 技术栈

### 前端通用
- **框架**: React 18.2 + TypeScript 5
- **构建工具**: Vite 4.5
- **状态管理**: Zustand 4.4 + React Query 5.0
- **表单**: React Hook Form 7.47 + Zod 3.22
- **样式**: Tailwind CSS 3.3
- **UI 组件**: Radix UI（无头组件）
- **图标**: Lucide React
- **图表**: Recharts 2.8

### H5 答卷特有
- **二维码扫描**: html5-qrcode 2.3.8
- **离线存储**: idb 8.0.3（IndexedDB）

### 后端
- **框架**: NestJS 10.0
- **认证**: Passport.js + JWT
- **数据库**: Supabase（PostgreSQL）
- **AI**: OpenAI SDK（DeepSeek 端点）
- **支付**: Stripe 14.7
- **文件处理**: XLSX、csv-parser
- **邮件**: Nodemailer + Handlebars
- **API 文档**: Swagger/OpenAPI

## 📋 功能模块

### 教师端（Web）
| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/` | 数据概览、最近活动 |
| 题库管理 | `/questions` | 题目 CRUD、AI 生成、导入导出 |
| 试卷管理 | `/papers` | 组卷、发布、二维码生成 |
| 报告分析 | `/reports` | 成绩分布、答题分析、时间分析 |
| 设置 | `/settings` | 账户、订阅、反馈 |

### 学生端（H5）
| 页面 | 路径 | 功能 |
|------|------|------|
| 进入答卷 | `/` | 扫码/输入考试码 |
| 答题 | `/quiz/:quizId` | 答题、计时、提交 |
| 结果 | `/result/:answerId` | 成绩、答案对比 |

### API 模块
| 模块 | 端点前缀 | 功能 |
|------|----------|------|
| Auth | `/api/auth` | 注册、登录、JWT 刷新 |
| Questions | `/api/questions` | 题目 CRUD、标签管理 |
| Papers | `/api/papers` | 试卷 CRUD、公开获取 |
| Answers | `/api/answers` | 提交答卷、统计 |
| Reports | `/api/reports` | 报告生成与查询 |
| AI | `/api/ai` | AI 题目生成 |
| Subscriptions | `/api/subscriptions` | 订阅、Stripe Webhook |
| Feedback | `/api/feedback` | 用户反馈管理 |

## 🛠️ 开发工具

### 代码格式化
```bash
# 格式化所有代码
yarn format

# 格式化特定项目
yarn workspace web format
```

### 代码检查
```bash
# 检查所有代码
yarn lint

# 检查特定项目
yarn workspace web lint
```

### 类型检查
```bash
# 检查所有类型
yarn type-check

# 检查特定项目
yarn workspace web type-check
```

### 测试
```bash
# 运行所有测试
yarn test

# 运行特定项目测试
yarn workspace api test
```

## 🗄️ 数据库管理

### 初始化数据库
1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `database/schema.sql` 中的 SQL 语句

### 主要数据表
- `users` - 用户信息
- `questions` - 题目库
- `papers` - 试卷
- `answers` - 答卷记录
- `reports` - 分析报告
- `subscriptions` - 订阅信息
- `feedback` - 用户反馈

## 🔧 环境变量

### 必需配置
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 认证
JWT_SECRET=your_jwt_secret
```

### 可选配置
```env
# AI 生成（DeepSeek）
OPENAI_API_KEY=your_deepseek_api_key
OPENAI_API_BASE=https://api.deepseek.com

# 支付（Stripe）
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 其他
NODE_ENV=development
PORT=3001
```

### 前端环境变量
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 开发规范

### Git 提交规范
使用 Conventional Commits 格式：
```bash
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试

### 分支管理
- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于集成测试
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

## 🐛 常见问题

### 1. 依赖安装失败
```bash
# 清理缓存
yarn cache clean

# 重新安装
rm -rf node_modules
yarn install
```

### 2. 端口冲突
检查端口占用：
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

### 3. 数据库连接失败
- 检查 Supabase 配置
- 验证网络连接
- 检查 API 密钥是否正确

### 4. 构建失败
- 检查 TypeScript 错误
- 验证环境变量配置
- 查看构建日志

### 5. AI 生成功能不可用
- 确认已配置 DeepSeek API 密钥
- 检查订阅计划是否支持 AI 功能

## 📚 相关文档

- [React 文档](https://react.dev/)
- [NestJS 文档](https://nestjs.com/)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Radix UI 文档](https://www.radix-ui.com/)
- [Stripe 文档](https://stripe.com/docs)
