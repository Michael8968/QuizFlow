# QuizFlow 部署指南

## 🚀 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Vercel)  │    │   H5 (Vercel)   │    │  后端 (Render)   │
│   Port: 3000    │    │   Port: 3002    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Supabase       │
                    │  (数据库 + 认证)  │
                    └─────────────────┘
```

## 📦 部署步骤

### 1. 前端部署 (Vercel)

#### 1.1 创建 Vercel 项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入 GitHub 仓库

#### 1.2 配置构建设置
```json
{
  "buildCommand": "pnpm build:web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "rootDirectory": "."
}
```

#### 1.3 设置环境变量
```env
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. H5 答卷部署 (Vercel)

#### 2.1 创建单独的 Vercel 项目
1. 创建新的 Vercel 项目
2. 选择相同的 GitHub 仓库
3. 配置不同的构建设置

#### 2.2 配置构建设置
```json
{
  "buildCommand": "pnpm build:h5",
  "outputDirectory": "apps/h5-quiz/dist",
  "installCommand": "pnpm install",
  "rootDirectory": "."
}
```

#### 2.3 设置环境变量
```env
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 后端部署 (Render)

#### 3.1 创建 Render 服务
1. 访问 [Render Dashboard](https://dashboard.render.com)
2. 点击 "New +" -> "Web Service"
3. 连接 GitHub 仓库

#### 3.2 配置服务设置
```yaml
Name: quizflow-api
Environment: Node
Build Command: pnpm install && pnpm build:api
Start Command: pnpm start:api
```

#### 3.3 设置环境变量
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. 数据库部署 (Supabase)

#### 4.1 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目 URL 和 API 密钥

#### 4.2 初始化数据库
1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `database/schema.sql` 中的 SQL 语句
3. 验证表结构和 RLS 策略

#### 4.3 配置存储
```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('question-images', 'question-images', true),
  ('reports', 'reports', true);
```

## 🔧 环境配置

### 开发环境
```env
# 前端
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_dev_supabase_url
VITE_SUPABASE_ANON_KEY=your_dev_supabase_anon_key

# 后端
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_dev_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_dev_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

### 生产环境
```env
# 前端
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=your_prod_supabase_url
VITE_SUPABASE_ANON_KEY=your_prod_supabase_anon_key

# 后端
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_prod_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_prod_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_prod_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 🚀 自动化部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build:web
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build:api
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📊 监控和日志

### 1. 应用监控
- **Vercel**: 内置监控和日志
- **Render**: 内置监控和日志
- **Supabase**: 内置监控和日志

### 2. 错误追踪
推荐使用 Sentry：
```bash
npm install @sentry/react @sentry/node
```

### 3. 性能监控
- 使用 Vercel Analytics
- 配置 Supabase 监控
- 设置 Render 监控

## 🔒 安全配置

### 1. 环境变量安全
- 使用 Vercel 和 Render 的环境变量管理
- 不要将敏感信息提交到代码仓库
- 定期轮换 API 密钥

### 2. 数据库安全
- 启用 Supabase RLS
- 配置适当的访问策略
- 定期备份数据

### 3. API 安全
- 启用 CORS 配置
- 使用 JWT 认证
- 实施请求频率限制

## 🚨 故障排除

### 1. 构建失败
```bash
# 检查依赖
pnpm install

# 检查类型错误
pnpm type-check

# 检查代码格式
pnpm lint
```

### 2. 部署失败
- 检查环境变量配置
- 验证构建命令
- 查看部署日志

### 3. 运行时错误
- 检查 API 连接
- 验证数据库连接
- 查看错误日志

## 📈 性能优化

### 1. 前端优化
- 启用代码分割
- 使用 CDN
- 优化图片资源
- 启用缓存

### 2. 后端优化
- 启用数据库连接池
- 使用 Redis 缓存
- 优化数据库查询
- 启用压缩

### 3. 数据库优化
- 创建适当的索引
- 优化查询性能
- 定期清理数据
- 监控查询性能

## 🔄 更新和维护

### 1. 定期更新
- 更新依赖包
- 应用安全补丁
- 更新 Node.js 版本

### 2. 备份策略
- 定期备份数据库
- 备份重要文件
- 测试恢复流程

### 3. 监控告警
- 设置性能告警
- 配置错误告警
- 监控资源使用
