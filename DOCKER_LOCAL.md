# Docker 本地构建和运行指南

本指南将帮助您在本地构建和运行 QuizFlow API 的 Docker 镜像。

## 📋 前置要求

1. **Docker** 已安装并运行
   ```bash
   docker --version
   ```

2. **环境变量文件**（可选但推荐）
   - 复制 `env.example` 为 `.env`
   - 填写必要的环境变量

## 🚀 快速开始

### 方式一：使用自动化脚本（推荐）

```bash
# 在项目根目录运行
./docker-build.sh
```

脚本会自动：
1. 构建 Docker 镜像
2. 停止并删除旧容器（如果存在）
3. 启动新容器
4. 显示容器状态和访问信息

### 方式二：手动构建和运行

#### 1. 构建镜像

```bash
# 在项目根目录运行
docker build -t quizflow-api:latest .
```

#### 2. 运行容器

**使用 .env 文件（推荐）：**

```bash
docker run -d \
  --name quizflow-api-test \
  -p 3001:3001 \
  --env-file .env \
  -e NODE_ENV=production \
  -e PORT=3001 \
  quizflow-api:latest
```

**手动指定环境变量：**

```bash
docker run -d \
  --name quizflow-api-test \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e JWT_SECRET=your_secret \
  quizflow-api:latest
```

## 📝 常用命令

### 查看容器状态

```bash
docker ps -f name=quizflow-api-test
```

### 查看日志

```bash
# 实时查看日志
docker logs -f quizflow-api-test

# 查看最近 100 行日志
docker logs --tail 100 quizflow-api-test
```

### 停止容器

```bash
docker stop quizflow-api-test
```

### 启动已停止的容器

```bash
docker start quizflow-api-test
```

### 删除容器

```bash
# 先停止容器
docker stop quizflow-api-test

# 删除容器
docker rm quizflow-api-test
```

### 删除镜像

```bash
docker rmi quizflow-api:latest
```

### 进入容器（调试用）

```bash
docker exec -it quizflow-api-test sh
```

## 🧪 测试 API

容器启动后，可以通过以下方式测试：

```bash
# 测试 API 文档
curl http://localhost:3001/api/docs

# 测试健康检查（如果已实现）
curl http://localhost:3001/api/health
```

在浏览器中访问：
- API 文档：http://localhost:3001/api/docs
- API 基础路径：http://localhost:3001/api

## 🔧 环境变量说明

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | `eyJhbGc...` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `production` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | - |
| `STRIPE_SECRET_KEY` | Stripe 密钥 | - |
| `ALLOWED_ORIGINS` | CORS 允许的源 | `http://localhost:3000,http://localhost:3002` |

## 🐛 故障排除

### 问题 1：构建失败

**错误：** `failed to solve: process "/bin/sh -c npm install -g yarn" did not complete successfully`

**解决：** 这通常是因为基础镜像已包含 yarn。Dockerfile 已处理此问题，使用条件检查。

### 问题 2：容器启动失败

**检查步骤：**
1. 查看容器日志：`docker logs quizflow-api-test`
2. 检查环境变量是否都已设置
3. 确认端口 3001 未被占用：`lsof -i :3001`

### 问题 3：无法访问 API

**检查步骤：**
1. 确认容器正在运行：`docker ps`
2. 检查端口映射：`docker port quizflow-api-test`
3. 查看容器日志：`docker logs quizflow-api-test`
4. 测试容器内部：`docker exec quizflow-api-test wget -qO- http://localhost:3001/api/docs`

### 问题 4：环境变量未生效

**解决：**
1. 确保 `.env` 文件在项目根目录
2. 检查 `.env` 文件格式（每行一个变量，无空格）
3. 重启容器：`docker restart quizflow-api-test`

## 📦 镜像优化

### 查看镜像大小

```bash
docker images quizflow-api
```

### 清理未使用的镜像和容器

```bash
# 清理未使用的容器
docker container prune

# 清理未使用的镜像
docker image prune

# 清理所有未使用的资源
docker system prune -a
```

## 🔄 更新镜像

当代码更新后，重新构建和运行：

```bash
# 停止并删除旧容器
docker stop quizflow-api-test
docker rm quizflow-api-test

# 重新构建镜像
docker build -t quizflow-api:latest .

# 运行新容器
./docker-build.sh
```

## 📚 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [腾讯云开发部署指南](./apps/api/DEPLOY_TENCENT_CLOUDBASE.md)
- [项目部署指南](./DEPLOYMENT.md)

