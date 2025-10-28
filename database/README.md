# Supabase 配置说明

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目 URL 和 API 密钥

## 2. 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 其他配置...
```

## 3. 数据库初始化

1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `database/schema.sql` 中的 SQL 语句
3. 验证表结构和 RLS 策略是否正确创建

## 4. 认证配置

在 Supabase Dashboard 中配置：

### 认证设置
- 启用邮箱注册
- 配置邮箱模板
- 设置重定向 URL

### 邮箱模板
- 注册确认邮件
- 密码重置邮件
- 邀请邮件

## 5. 存储配置

创建存储桶用于文件上传：

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('question-images', 'question-images', true),
  ('reports', 'reports', true);
```

## 6. 实时订阅

启用实时功能用于：
- 实时答卷状态更新
- 实时成绩统计
- 实时通知

## 7. 安全配置

### API 限制
- 设置 API 请求频率限制
- 配置 CORS 策略
- 启用 API 密钥验证

### 数据库安全
- 启用 RLS (Row Level Security)
- 配置适当的访问策略
- 定期备份数据

## 8. 监控和日志

- 启用 Supabase 监控
- 配置错误日志收集
- 设置性能监控

## 9. 部署配置

### 生产环境
- 使用生产数据库
- 配置 CDN
- 启用 SSL

### 开发环境
- 使用开发数据库
- 配置本地开发环境
- 启用调试模式
