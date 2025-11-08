# Supabase OAuth 配置指南

## 问题：400 Bad Request 错误

如果遇到 `400 Bad Request` 错误，通常是因为 Supabase 中未正确配置 OAuth 提供商。请按照以下步骤配置：

## 配置步骤

### 1. 在 Supabase Dashboard 中配置 OAuth 提供商

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **Providers**
4. 找到 **Google** 和 **GitHub** 提供商

### 2. 配置 Google OAuth

#### 2.1 在 Google Cloud Console 创建 OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Google+ API**
4. 进入 **Credentials** > **Create Credentials** > **OAuth client ID**
5. 选择应用类型：**Web application**
6. 配置授权重定向 URI：
   ```
   https://tjyvwucvhkfltwvdqflu.supabase.co/auth/v1/callback
   ```
   （将 `tjyvwucvhkfltwvdqflu` 替换为你的 Supabase 项目 ID）
7. 保存后获取 **Client ID** 和 **Client Secret**

#### 2.2 在 Supabase 中配置 Google

1. 在 Supabase Dashboard 中，找到 **Google** 提供商
2. 点击 **Enable**
3. 填入：
   - **Client ID (for OAuth)**: 从 Google Cloud Console 获取
   - **Client Secret (for OAuth)**: 从 Google Cloud Console 获取
4. 点击 **Save**

### 3. 配置 GitHub OAuth

#### 3.1 在 GitHub 创建 OAuth App

1. 访问 GitHub Settings > [Developer settings](https://github.com/settings/developers)
2. 点击 **OAuth Apps** > **New OAuth App**
3. 填写信息：
   - **Application name**: QuizFlow (或你的应用名称)
   - **Homepage URL**: `http://localhost:3003` (开发环境)
   - **Authorization callback URL**: 
     ```
     https://tjyvwucvhkfltwvdqflu.supabase.co/auth/v1/callback
     ```
     （将 `tjyvwucvhkfltwvdqflu` 替换为你的 Supabase 项目 ID）
4. 点击 **Register application**
5. 复制 **Client ID** 和生成 **Client Secret**

#### 3.2 在 Supabase 中配置 GitHub

1. 在 Supabase Dashboard 中，找到 **GitHub** 提供商
2. 点击 **Enable**
3. 填入：
   - **Client ID (for OAuth)**: 从 GitHub 获取
   - **Client Secret (for OAuth)**: 从 GitHub 获取
4. 点击 **Save**

### 4. 配置重定向 URL

1. 在 Supabase Dashboard 中，进入 **Authentication** > **URL Configuration**
2. 在 **Redirect URLs** 中添加以下 URL：
   ```
   http://localhost:3003/auth/callback
   https://yourdomain.com/auth/callback
   ```
   （根据你的环境添加相应的 URL）

### 5. 验证配置

配置完成后，重新尝试登录。如果仍有问题，请检查：

1. ✅ Google/GitHub 提供商是否已启用
2. ✅ Client ID 和 Secret 是否正确
3. ✅ 重定向 URL 是否已添加到允许列表
4. ✅ Google Cloud Console 中的授权重定向 URI 是否正确
5. ✅ GitHub OAuth App 中的回调 URL 是否正确

## 问题：500 Internal Server Error

如果遇到 `500 Internal Server Error`，这通常意味着 Supabase 后端在处理 OAuth 回调时出错。可能的原因：

### 1. 数据库触发器或函数错误

检查 Supabase Dashboard 中的日志：
1. 进入 **Logs** > **Postgres Logs**
2. 查看是否有错误信息
3. 检查是否有数据库触发器失败

### 2. 用户表不存在或结构不匹配

确保数据库中有 `users` 表，并且结构正确。如果使用自定义用户表，需要：
1. 检查表是否存在
2. 检查是否有适当的触发器来自动创建用户记录
3. 检查 RLS 策略是否正确配置

### 3. 数据库连接问题

检查 Supabase 项目的数据库连接状态。

### 4. 修复建议

如果遇到 500 错误，可以尝试：

1. **检查 Supabase Dashboard 日志**
   - 进入 **Logs** > **Postgres Logs** 查看详细错误

2. **检查数据库触发器**
   - 确保没有触发器在用户创建时失败
   - 检查是否有外键约束问题

3. **简化用户创建流程**
   - 如果使用自定义用户表，确保触发器正确配置
   - 或者暂时禁用自定义触发器，使用 Supabase 默认的用户管理

4. **检查 RLS 策略**
   - 确保 `auth.users` 表有适当的访问权限
   - 检查自定义用户表的 RLS 策略

## 常见问题

### Q: 仍然出现 400 错误？
A: 检查浏览器控制台的详细错误信息，确认是哪个步骤出错。

### Q: 重定向后显示 500 错误？
A: 
1. 检查 Supabase Dashboard 中的日志
2. 确认数据库表结构正确
3. 检查是否有数据库触发器失败
4. 确保 RLS 策略正确配置

### Q: 重定向后显示错误？
A: 确保重定向 URL 在 Supabase 的允许列表中，并且格式完全匹配（包括协议 http/https）。

### Q: 生产环境如何配置？
A: 在生产环境中，需要：
1. 在 Google Cloud Console 和 GitHub 中添加生产环境的回调 URL
2. 在 Supabase 中添加生产环境的重定向 URL
3. 确保使用 HTTPS

## 测试

配置完成后，点击注册页面的 Google 或 GitHub 按钮，应该会：
1. 跳转到对应的 OAuth 提供商登录页面
2. 登录成功后重定向回 `/auth/callback`
3. 自动保存用户信息并跳转到首页

