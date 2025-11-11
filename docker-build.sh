#!/bin/bash

# QuizFlow API Docker 本地构建和运行脚本
# 用于在部署到腾讯云开发之前测试 Docker 镜像

set -e

echo "🐳 QuizFlow API Docker 构建和运行脚本"
echo "======================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 已安装${NC}"

# 镜像和容器名称
IMAGE_NAME="quizflow-api"
CONTAINER_NAME="quizflow-api-test"

# 停止并删除旧容器（如果存在）
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo -e "${YELLOW}停止并删除旧容器...${NC}"
    docker stop $CONTAINER_NAME > /dev/null 2>&1 || true
    docker rm $CONTAINER_NAME > /dev/null 2>&1 || true
fi

# 构建镜像
echo -e "${BLUE}📦 构建 Docker 镜像...${NC}"
echo -e "${YELLOW}这可能需要几分钟时间...${NC}"
docker build -t $IMAGE_NAME:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 镜像构建成功${NC}"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi

# 检查环境变量文件
ENV_FILE=""
if [ -f ".env" ]; then
    ENV_FILE=".env"
    echo -e "${GREEN}✓ 找到环境变量文件: .env${NC}"
elif [ -f "env.example" ]; then
    echo -e "${YELLOW}⚠️  未找到 .env 文件，但找到了 env.example${NC}"
    echo -e "${YELLOW}   请复制 env.example 为 .env 并填写必要的环境变量${NC}"
fi

# 显示环境变量提示
echo ""
echo -e "${BLUE}📋 必需的环境变量：${NC}"
echo -e "  - SUPABASE_URL"
echo -e "  - SUPABASE_SERVICE_ROLE_KEY"
echo -e "  - JWT_SECRET"
echo ""

# 运行容器
echo -e "${BLUE}🚀 启动容器...${NC}"

if [ -n "$ENV_FILE" ]; then
    echo -e "${GREEN}使用环境变量文件: $ENV_FILE${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        -p 3001:3001 \
        --env-file $ENV_FILE \
        -e NODE_ENV=production \
        -e PORT=3001 \
        $IMAGE_NAME:latest
else
    echo -e "${YELLOW}⚠️  未找到 .env 文件${NC}"
    echo -e "${YELLOW}请手动运行以下命令（替换环境变量值）：${NC}"
    echo ""
    echo "docker run -d \\"
    echo "  --name $CONTAINER_NAME \\"
    echo "  -p 3001:3001 \\"
    echo "  -e NODE_ENV=production \\"
    echo "  -e PORT=3001 \\"
    echo "  -e SUPABASE_URL=your_supabase_url \\"
    echo "  -e SUPABASE_SERVICE_ROLE_KEY=your_key \\"
    echo "  -e JWT_SECRET=your_secret \\"
    echo "  $IMAGE_NAME:latest"
    echo ""
    exit 0
fi

# 等待容器启动
echo -e "${BLUE}⏳ 等待容器启动...${NC}"
sleep 5

# 检查容器状态
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${GREEN}✓ 容器运行中${NC}"
    echo ""
    echo -e "${GREEN}📊 容器信息：${NC}"
    docker ps -f name=$CONTAINER_NAME
    echo ""
    echo -e "${GREEN}📝 查看日志：${NC}"
    echo "  docker logs -f $CONTAINER_NAME"
    echo ""
    echo -e "${GREEN}🧪 测试 API：${NC}"
    echo "  curl http://localhost:3001/api/docs"
    echo ""
    echo -e "${GREEN}🛑 停止容器：${NC}"
    echo "  docker stop $CONTAINER_NAME"
    echo ""
    echo -e "${GREEN}🗑️  删除容器：${NC}"
    echo "  docker rm $CONTAINER_NAME"
    echo ""
    echo -e "${GREEN}✅ 部署完成！API 运行在 http://localhost:3001${NC}"
else
    echo -e "${RED}❌ 容器启动失败${NC}"
    echo -e "${YELLOW}查看日志：${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

