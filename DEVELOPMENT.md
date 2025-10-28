# QuizFlow 开发指南

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- PostgreSQL (或使用 Supabase)
- Git

### 安装依赖
```bash
# 安装根目录依赖
pnpm install

# 安装所有子项目依赖
pnpm install --recursive
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

3. 配置 OpenAI：
   - 获取 OpenAI API 密钥
   - 更新 `.env` 文件中的 OpenAI 配置

### 启动开发环境
```bash
# 启动所有服务
pnpm dev

# 或分别启动
pnpm dev:web      # 教师端 (http://localhost:3000)
pnpm dev:h5       # H5 答卷 (http://localhost:3002)
pnpm dev:api      # 后端 API (http://localhost:3001)
```

## 📁 项目结构

```
QuizFlow/
├── apps/
│   ├── web/                 # 教师端 Web 应用
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── hooks/       # 自定义 Hooks
│   │   │   ├── stores/      # 状态管理
│   │   │   ├── lib/         # 工具函数
│   │   │   └── types/       # 类型定义
│   │   └── package.json
│   ├── h5-quiz/            # H5 答卷子项目
│   │   ├── src/
│   │   │   ├── components/  # 答卷组件
│   │   │   ├── pages/       # 答卷页面
│   │   │   ├── stores/      # 答卷状态
│   │   │   └── types/       # 答卷类型
│   │   └── package.json
│   └── api/                # NestJS 后端 API
│       ├── src/
│       │   ├── auth/        # 认证模块
│       │   ├── questions/   # 题目管理
│       │   ├── papers/      # 试卷管理
│       │   ├── answers/     # 答卷管理
│       │   ├── reports/     # 报告管理
│       │   ├── ai/          # AI 功能
│       │   ├── subscriptions/ # 订阅管理
│       │   └── common/      # 公共模块
│       └── package.json
├── database/
│   ├── schema.sql          # 数据库结构
│   └── README.md           # 数据库配置说明
├── docs/                   # 项目文档
├── scripts/               # 构建和部署脚本
└── package.json           # 根目录配置
```

## 🛠️ 开发工具

### 代码格式化
```bash
# 格式化所有代码
pnpm format

# 格式化特定项目
pnpm --filter web format
```

### 代码检查
```bash
# 检查所有代码
pnpm lint

# 检查特定项目
pnpm --filter web lint
```

### 类型检查
```bash
# 检查所有类型
pnpm type-check

# 检查特定项目
pnpm --filter web type-check
```

### 测试
```bash
# 运行所有测试
pnpm test

# 运行特定项目测试
pnpm --filter api test
```

## 🗄️ 数据库管理

### 初始化数据库
1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `database/schema.sql` 中的 SQL 语句

### 数据库迁移
```bash
# 生成迁移文件
pnpm db:generate

# 运行迁移
pnpm db:migrate

# 回滚迁移
pnpm db:rollback
```

## 🚀 部署

### 前端部署 (Vercel)
1. 连接 GitHub 仓库到 Vercel
2. 配置构建命令：`pnpm build:web`
3. 配置输出目录：`apps/web/dist`
4. 设置环境变量

### 后端部署 (Render)
1. 连接 GitHub 仓库到 Render
2. 配置构建命令：`pnpm build:api`
3. 配置启动命令：`pnpm start:api`
4. 设置环境变量

### H5 答卷部署 (Vercel)
1. 创建单独的 Vercel 项目
2. 配置构建命令：`pnpm build:h5`
3. 配置输出目录：`apps/h5-quiz/dist`

## 🔧 环境变量

### 必需配置
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥
- `OPENAI_API_KEY`: OpenAI API 密钥
- `JWT_SECRET`: JWT 密钥

### 可选配置
- `NODE_ENV`: 环境模式
- `PORT`: API 服务端口
- `STRIPE_SECRET_KEY`: Stripe 密钥
- `STRIPE_PUBLISHABLE_KEY`: Stripe 公钥

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
- 添加 JSDoc 注释

### 分支管理
- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于集成测试
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

## 🐛 常见问题

### 1. 依赖安装失败
```bash
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules
pnpm install
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

## 📚 相关文档

- [React 文档](https://react.dev/)
- [NestJS 文档](https://nestjs.com/)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
