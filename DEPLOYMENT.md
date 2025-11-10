# QuizFlow 部署指南

## 🚀 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Vercel)  │    │   H5 (Vercel)   │    │  后端 (多种选择)  │
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

### 后端部署选项

- **Render**：适合海外部署，免费计划支持（详见下方）
- **腾讯云开发（CloudBase）**：适合国内部署，使用 Docker 方式（详见 `apps/api/DEPLOY_TENCENT_CLOUDBASE.md`）

## 📦 部署步骤

### 1. 前端部署 (Vercel)

#### 1.1 创建 Vercel 项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入 GitHub 仓库

#### 1.2 配置构建设置
```json
{
  "buildCommand": "yarn build:web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "yarn install",
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
  "buildCommand": "yarn build:h5",
  "outputDirectory": "apps/h5-quiz/dist",
  "installCommand": "yarn install",
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

#### 3.1 注册和登录 Render

1. **访问 Render 官网**
   - 打开 [https://dashboard.render.com](https://dashboard.render.com)
   - 点击右上角 "Get Started for Free" 或 "Sign Up"

2. **注册账号**
   - 可以使用 GitHub 账号直接登录（推荐）
   - 或使用邮箱注册

3. **验证邮箱**（如果使用邮箱注册）
   - 检查邮箱中的验证链接并点击确认

#### 3.2 创建 Web Service

1. **进入 Dashboard**
   - 登录后，点击左侧菜单的 "Dashboard"
   - 点击右上角的 "New +" 按钮
   - 选择 "Web Service"

2. **连接 GitHub 仓库**
   - 如果是第一次使用，需要授权 Render 访问 GitHub
   - 点击 "Connect account" 并授权
   - 选择你的 GitHub 仓库（QuizFlow）
   - 点击 "Connect"

3. **配置服务基本信息**
   ```
   Name: quizflow-api
   Region: 选择离你最近的区域（如 Singapore）
   Branch: main（或你的主分支）
   Root Directory: （留空，使用根目录）
   ```

#### 3.3 配置构建和启动命令

在 "Build & Deploy" 部分配置：

**Environment（环境）**
- 选择 `Node`

**Build Command（构建命令）**
```bash
cd apps/api && yarn install && yarn build
```
或者如果使用根目录的 yarn：
```bash
yarn install && yarn build:api
```

**Start Command（启动命令）**
```bash
cd apps/api && node dist/main.js
```
或者：
```bash
cd apps/api && yarn start:prod
```

**注意**：Render 会自动设置 `PORT` 环境变量，你的应用应该使用 `process.env.PORT` 或 `$PORT`。你的代码已经通过 `configService.get('PORT', 3001)` 支持这个。

#### 3.4 设置环境变量

在 "Environment" 部分，点击 "Add Environment Variable" 添加以下变量：

**必需的环境变量：**
```env
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

**可选的环境变量：**
```env
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**重要提示：**
- `PORT` 变量不需要手动设置，Render 会自动提供
- 所有敏感信息（API 密钥、密钥等）都应该通过环境变量设置，不要硬编码在代码中
- 环境变量设置后，服务会自动重新部署

#### 3.5 配置 CORS（重要）

由于你的 API 需要被前端调用，需要更新 CORS 配置。在 `apps/api/src/main.ts` 中，确保生产环境的 CORS 配置包含你的前端域名：

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000', // 开发环境
    'http://localhost:3002', // 开发环境
    'https://your-frontend-domain.vercel.app', // 生产环境前端
    'https://your-h5-domain.vercel.app', // 生产环境 H5
  ],
  credentials: true,
});
```

或者使用环境变量动态配置：
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3002',
];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
```

然后在 Render 环境变量中添加：
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-h5.vercel.app
```

#### 3.6 部署和监控

1. **首次部署**
   - 配置完成后，点击 "Create Web Service"
   - Render 会自动开始构建和部署
   - 可以在 "Events" 标签页查看部署进度

2. **查看日志**
   - 点击服务名称进入详情页
   - 在 "Logs" 标签页查看实时日志
   - 可以筛选构建日志或运行时日志

3. **监控服务状态**
   - Dashboard 显示服务状态（Live、Building、Failed 等）
   - 绿色表示服务正常运行
   - 点击服务可以查看详细信息

4. **获取服务 URL**
   - 部署成功后，Render 会提供一个 URL
   - 格式：`https://quizflow-api.onrender.com`
   - 这个 URL 就是你的 API 地址

#### 3.7 自动部署配置

Render 默认会在以下情况自动部署：
- 推送到连接的 Git 分支（通常是 main）
- 手动触发部署（点击 "Manual Deploy"）

**配置自动部署：**
- 在服务设置中，确保 "Auto-Deploy" 已启用
- 可以选择部署特定分支或所有分支

#### 3.8 自定义域名（可选）

1. **添加自定义域名**
   - 在服务设置中，点击 "Settings"
   - 滚动到 "Custom Domains" 部分
   - 点击 "Add Custom Domain"
   - 输入你的域名（如 `api.yourdomain.com`）

2. **配置 DNS**
   - Render 会提供 DNS 配置说明
   - 在你的域名提供商处添加 CNAME 记录
   - 等待 DNS 传播（通常几分钟到几小时）

#### 3.9 服务计划选择

**免费计划（Free Tier）：**
- 适合开发和测试
- 服务在 15 分钟无活动后会休眠
- 首次请求可能需要几秒钟唤醒
- 每月有使用限制

**付费计划（Starter/Professional）：**
- 服务始终运行，不会休眠
- 更好的性能
- 更多资源
- 适合生产环境

#### 3.10 常见问题排查

**问题 1：构建失败**
- 检查构建命令是否正确
- 查看构建日志中的错误信息
- 确保所有依赖都在 `package.json` 中
- 检查 Node.js 版本是否兼容（项目要求 >= 20.0.0）

**问题 2：服务启动失败**
- 检查启动命令是否正确
- 确保 `dist/main.js` 文件存在（构建成功）
- 查看运行时日志
- 检查环境变量是否都已设置

**问题 3：端口错误**
- Render 会自动设置 `PORT` 环境变量
- 确保代码使用 `process.env.PORT` 而不是硬编码端口
- 你的代码已经正确配置：`configService.get('PORT', 3001)`

**问题 4：CORS 错误**
- 检查前端域名是否在 CORS 允许列表中
- 更新 `main.ts` 中的 CORS 配置
- 确保 `credentials: true` 已设置

**问题 5：环境变量未生效**
- 环境变量修改后需要重新部署
- 检查变量名是否正确（区分大小写）
- 确保没有多余的空格

**问题 6：服务休眠（免费计划）**
- 这是免费计划的正常行为
- 首次请求会唤醒服务（可能需要几秒）
- 考虑升级到付费计划以避免休眠

#### 3.11 性能优化建议

1. **启用健康检查**
   - 在服务设置中添加健康检查路径
   - 例如：`/api/health`
   - Render 会定期检查服务状态

2. **配置环境变量缓存**
   - Render 会自动缓存构建
   - 确保 `node_modules` 在 `.gitignore` 中

3. **监控资源使用**
   - 在 Dashboard 查看 CPU 和内存使用情况
   - 如果资源不足，考虑升级计划

4. **设置部署通知**
   - 在服务设置中配置通知
   - 可以发送邮件或 Slack 通知

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
      - run: npm install -g yarn
      - run: yarn install
      - run: yarn build:web
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
      - run: npm install -g yarn
      - run: yarn install
      - run: yarn build:api
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
yarn install

# 检查类型错误
yarn type-check

# 检查代码格式
yarn lint
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
