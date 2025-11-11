# Docker 镜像加速器配置指南

如果遇到 Docker 镜像拉取超时问题，可以配置国内镜像加速器。

## 🚀 快速配置（推荐）

### macOS / Linux

编辑或创建 Docker 配置文件：

**macOS (Docker Desktop):**
1. 打开 Docker Desktop
2. 进入 Settings (设置) → Docker Engine
3. 在 JSON 配置中添加镜像加速器：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

4. 点击 "Apply & Restart" 应用并重启

**Linux:**
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 国内常用镜像源

| 镜像源 | 地址 |
|--------|------|
| 中科大 | `https://docker.mirrors.ustc.edu.cn` |
| 网易 | `https://hub-mirror.c.163.com` |
| 百度云 | `https://mirror.baidubce.com` |
| 阿里云 | 需要登录获取专属地址 |
| 腾讯云 | 需要登录获取专属地址 |

### 阿里云镜像加速器（推荐）

1. 登录 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
2. 进入「镜像加速器」页面
3. 复制专属加速器地址
4. 按照上述方式配置

### 腾讯云镜像加速器

1. 登录 [腾讯云容器服务](https://console.cloud.tencent.com/tke2)
2. 进入「镜像仓库」→「镜像加速器」
3. 复制专属加速器地址
4. 按照上述方式配置

## 🔍 验证配置

配置完成后，验证是否生效：

```bash
docker info | grep -A 10 "Registry Mirrors"
```

应该能看到配置的镜像源列表。

## 🔄 重新拉取镜像

配置完成后，重新拉取镜像：

```bash
docker pull node:20-alpine
```

## 🛠️ 临时解决方案

如果暂时无法配置镜像加速器，可以：

1. **使用已有的 node:20 镜像**（修改 Dockerfile）
2. **使用代理**（如果可用）
3. **手动下载镜像**（从其他源）

## 📝 修改 Dockerfile 使用 node:20

如果无法拉取 alpine 版本，可以临时使用标准版本：

```dockerfile
FROM node:20 AS builder
# ... 其他配置保持不变
```

注意：标准版本镜像会更大，但功能相同。

