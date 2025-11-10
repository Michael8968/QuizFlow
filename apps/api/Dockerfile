# 使用官方 Node.js 20 LTS 作为基础镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 yarn（如果基础镜像没有）
RUN npm install -g yarn

# 复制根目录的 package.json 和 yarn.lock（用于 workspace 管理）
COPY package.json yarn.lock ./

# 复制 API 项目的 package.json
COPY apps/api/package.json ./apps/api/

# 安装依赖（使用 yarn workspaces）
RUN yarn install --frozen-lockfile --production=false

# 复制所有源代码
COPY apps/api ./apps/api
COPY tsconfig.json ./

# 构建应用
WORKDIR /app/apps/api
RUN yarn build

# 生产环境镜像
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 安装 yarn
RUN npm install -g yarn

# 复制根目录的 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 复制 API 项目的 package.json
COPY apps/api/package.json ./apps/api/

# 只安装生产依赖
RUN yarn install --frozen-lockfile --production=true

# 从构建阶段复制编译后的代码
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# 设置工作目录为 API 目录
WORKDIR /app/apps/api

# 暴露端口（腾讯云开发云托管默认使用 80 端口）
# 应用会从 PORT 环境变量读取端口，云托管会自动设置
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production
# PORT 环境变量由云托管自动设置，默认为 80

# 启动应用
CMD ["node", "dist/main.js"]

