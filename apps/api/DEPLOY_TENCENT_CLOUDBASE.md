# 腾讯云开发（CloudBase）Docker 部署指南

本指南将帮助您将 QuizFlow API 部署到腾讯云开发的云托管服务。

## 📋 前置要求

1. **腾讯云账号**
   - 访问 [腾讯云官网](https://cloud.tencent.com/) 注册账号
   - 完成实名认证

2. **开通云开发服务**
   - 访问 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)
   - 创建云开发环境（如果还没有）

3. **本地环境**
   - Docker（用于本地测试）
   - Git（用于代码管理）

## ⚠️ 重要配置说明

在开始部署前，请确保在腾讯云开发控制台中正确配置以下参数：

**构建配置（关键！）：**
- **代码根目录**：必须设置为 `.`（项目根目录）
- **Dockerfile 路径**：`Dockerfile`（相对于代码根目录）
- **构建目录**：`.`（项目根目录）

**常见错误：**
- ❌ 错误：代码根目录设置为 `apps/api`
- ✅ 正确：代码根目录设置为 `.`（项目根目录）

如果代码根目录设置错误，会导致找不到 `package.json`、`yarn.lock` 等根目录文件。

## 🚀 部署步骤

### 1. 准备代码仓库

确保您的代码已推送到 Git 仓库（GitHub、GitLab 或 Gitee）。

### 2. 创建云托管服务

1. **登录云开发控制台**
   - 访问 [云开发控制台](https://console.cloud.tencent.com/tcb)
   - 选择或创建云开发环境

2. **进入云托管**
   - 在左侧菜单选择「云托管」
   - 点击「新建服务」

3. **配置服务信息**
   ```
   服务名称: quizflow-api
   服务描述: QuizFlow API 服务
   地域: 选择离您最近的区域（如：广州、上海、北京）
   ```

### 3. 创建版本（使用 Dockerfile）

1. **选择部署方式**
   - 选择「使用 Dockerfile 构建」
   - 选择代码仓库（GitHub/GitLab/Gitee）
   - 选择仓库分支（通常是 `main` 或 `master`）

2. **配置构建信息**
   ```
   代码根目录: .（项目根目录，不是 apps/api）
   Dockerfile 路径: Dockerfile（相对于代码根目录）
   构建目录: .（项目根目录）
   ```
   
   **重要提示：**
   - 代码根目录必须设置为项目根目录（`.`），而不是 `apps/api`
   - 因为 Dockerfile 需要访问根目录的 `package.json` 和 `yarn.lock` 文件
   - Dockerfile 位于项目根目录

3. **配置版本信息**
   ```
   版本名称: v1.0.0（或使用自动生成）
   版本描述: 初始版本
   ```

### 4. 配置环境变量

在创建版本时，添加以下环境变量：

**必需的环境变量：**
```env
NODE_ENV=production
PORT=80
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

**可选的环境变量：**
```env
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-h5-domain.com
```

**重要提示：**
- 腾讯云开发的云托管默认使用端口 `80`，但应用应该读取 `PORT` 环境变量
- 所有敏感信息都应该通过环境变量设置，不要硬编码在代码中
- 环境变量可以在服务设置中随时修改

### 5. 配置资源规格

根据您的需求选择合适的资源配置：

**推荐配置（生产环境）：**
```
CPU: 1 核
内存: 2 GB
最小实例数: 1
最大实例数: 10
```

**开发/测试配置：**
```
CPU: 0.5 核
内存: 1 GB
最小实例数: 0（支持缩容到 0）
最大实例数: 2
```

### 6. 配置访问方式

1. **选择访问方式**
   - 选择「公网访问」（如果需要从外部访问）
   - 或选择「内网访问」（仅在云开发环境内访问）

2. **配置域名（可选）**
   - 可以绑定自定义域名
   - 或使用云开发提供的默认域名

### 7. 部署和发布

1. **开始部署**
   - 点击「开始部署」
   - 等待构建和部署完成（通常需要 5-10 分钟）

2. **查看部署日志**
   - 在「版本管理」中查看构建日志
   - 检查是否有构建错误

3. **发布版本**
   - 部署成功后，点击「发布」
   - 选择要发布的版本
   - 配置流量比例（灰度发布）

### 8. 验证部署

1. **获取访问地址**
   - 在服务详情页查看访问地址
   - 格式：`https://your-service-id.tcb.qcloud.la`

2. **测试 API**
   ```bash
   # 测试健康检查（如果已实现）
   curl https://your-service-id.tcb.qcloud.la/api/health
   
   # 测试 API 文档
   curl https://your-service-id.tcb.qcloud.la/api/docs
   ```

## 🔧 本地 Docker 测试

在部署到云开发之前，可以在本地测试 Docker 镜像：

```bash
# 进入 API 目录
cd apps/api

# 构建 Docker 镜像
docker build -t quizflow-api:latest .

# 运行容器（需要设置环境变量）
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e JWT_SECRET=your_secret \
  --name quizflow-api \
  quizflow-api:latest

# 查看日志
docker logs -f quizflow-api

# 停止容器
docker stop quizflow-api
docker rm quizflow-api
```

## 📝 持续部署配置

### 方式一：自动部署（推荐）

云开发支持自动部署，当代码推送到指定分支时自动触发部署：

1. 在服务设置中启用「自动部署」
2. 配置触发分支（如 `main`）
3. 每次推送代码到该分支时，会自动触发构建和部署

### 方式二：手动部署

1. 在云开发控制台选择服务
2. 点击「新建版本」
3. 选择代码仓库和分支
4. 配置构建参数
5. 开始部署

## 🔍 监控和日志

### 查看日志

1. **实时日志**
   - 在服务详情页选择「日志」
   - 可以查看实时日志和搜索历史日志

2. **构建日志**
   - 在「版本管理」中查看构建日志
   - 可以下载完整的构建日志

### 监控指标

云开发提供以下监控指标：
- 请求量（QPS）
- 响应时间
- 错误率
- CPU 使用率
- 内存使用率

## 🚨 故障排除

### 问题 1：构建失败

**可能原因：**
- Dockerfile 路径不正确
- 依赖安装失败
- 代码编译错误

**解决方法：**
1. 检查构建日志中的错误信息
2. 确认 Dockerfile 路径正确
3. 在本地测试 Docker 构建：`docker build -t test .`
4. 检查 `package.json` 中的依赖是否正确

### 问题 2：服务启动失败

**可能原因：**
- 环境变量缺失
- 端口配置错误
- 数据库连接失败

**解决方法：**
1. 检查环境变量是否都已设置
2. 查看运行时日志
3. 确认 `PORT` 环境变量正确（云托管使用 80 端口）
4. 测试数据库连接

### 问题 3：无法访问服务

**可能原因：**
- 服务未发布
- 访问方式配置错误
- 域名解析问题

**解决方法：**
1. 确认版本已发布
2. 检查访问方式配置（公网/内网）
3. 测试默认域名是否可访问
4. 检查防火墙和安全组设置

### 问题 4：CORS 错误

**解决方法：**
1. 在环境变量中设置 `ALLOWED_ORIGINS`
2. 包含所有需要访问 API 的前端域名
3. 格式：`https://domain1.com,https://domain2.com`

## 💰 费用说明

腾讯云开发的云托管按实际使用量计费：

- **CPU 和内存**：按实际使用时间计费
- **流量**：按实际流量计费
- **存储**：按镜像存储空间计费

**节省成本建议：**
- 开发环境设置最小实例数为 0（支持缩容到 0）
- 使用合适的资源配置（不要过度配置）
- 定期清理不需要的版本和镜像

## 📚 相关文档

- [腾讯云开发官方文档](https://cloud.tencent.com/document/product/876)
- [云托管使用指南](https://cloud.tencent.com/document/product/1243)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

## 🔄 更新部署

当需要更新 API 时：

1. **推送代码到 Git 仓库**
   ```bash
   git add .
   git commit -m "更新 API 功能"
   git push origin main
   ```

2. **自动部署**（如果已启用）
   - 云开发会自动检测代码变更
   - 自动触发构建和部署

3. **手动部署**（如果需要）
   - 在云开发控制台创建新版本
   - 选择最新的代码分支
   - 开始部署

4. **发布新版本**
   - 部署成功后，发布新版本
   - 可以选择灰度发布（逐步切换流量）

## ✅ 部署检查清单

- [ ] 代码已推送到 Git 仓库
- [ ] 创建了云托管服务
- [ ] 配置了所有必需的环境变量
- [ ] 设置了合适的资源规格
- [ ] 配置了访问方式
- [ ] 成功构建和部署
- [ ] 版本已发布
- [ ] 测试了 API 访问
- [ ] 配置了监控和告警
- [ ] 更新了前端 API 地址

