# 使用官方 Node.js 20 LTS 作为基础镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 yarn（如果基础镜像没有）
# 检查 yarn 是否已安装，如果没有则安装
RUN command -v yarn >/dev/null 2>&1 || npm install -g yarn

# 复制根目录的 package.json 和 yarn.lock（用于 workspace 管理）
# 注意：构建上下文应该是项目根目录
# 先复制依赖文件，利用 Docker 层缓存
COPY package.json ./
COPY yarn.lock* ./

# 复制 API 项目的 package.json
COPY apps/api/package.json ./apps/api/

# 安装依赖（使用 yarn workspaces）
# 使用 --frozen-lockfile 确保依赖版本一致性
# 跳过 puppeteer 的 Chromium 下载（如果不需要浏览器功能）
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean

# 复制所有源代码（tsconfig.json 已经在 apps/api 目录中）
COPY apps/api ./apps/api

# 构建应用
WORKDIR /app/apps/api
RUN yarn build

# 生产环境镜像
FROM node:20-alpine AS production

# 设置时区为上海（解决时区不一致问题）
# 参考：https://docs.cloudbase.net/run/best-practice/fix-timezone
# 配置 Alpine 镜像源为国内镜像（解决网络问题）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories || \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories || true

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apk del tzdata

# 设置工作目录
WORKDIR /app

# 安装 yarn（如果基础镜像没有）
# 检查 yarn 是否已安装，如果没有则安装
RUN command -v yarn >/dev/null 2>&1 || npm install -g yarn

# 复制根目录的 package.json 和 yarn.lock
# 先复制依赖文件，利用 Docker 层缓存
COPY package.json ./
COPY yarn.lock* ./

# 复制 API 项目的 package.json
COPY apps/api/package.json ./apps/api/

# 只安装生产依赖
# 使用 --frozen-lockfile 确保依赖版本一致性
# 跳过 puppeteer 的 Chromium 下载（如果不需要浏览器功能）
# 清理缓存以减少镜像大小
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean && \
    rm -rf /tmp/* /var/cache/apk/*

# 从构建阶段复制编译后的代码
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# 设置工作目录为 API 目录
WORKDIR /app/apps/api

# 创建非 root 用户（安全最佳实践）
# 注意：需要先设置权限，再切换用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app/apps/api
USER nodejs

# 暴露端口
# 本地测试使用 3001，腾讯云开发云托管使用 80
# 应用会从 PORT 环境变量读取端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production
# PORT 环境变量由云托管自动设置，默认为 80

# 健康检查（可选，用于监控容器状态）
# 检查应用是否正常响应（通过检查进程是否存在）
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/api/docs', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# 启动应用
CMD ["node", "dist/main.js"]

