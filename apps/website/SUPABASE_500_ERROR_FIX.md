# 修复 Supabase OAuth 500 错误

## 问题原因

500 错误通常是因为数据库触发器函数 `handle_new_user()` 在 OAuth 用户注册时出错。这个触发器会在 `auth.users` 表创建新用户时，自动在 `public.users` 表中创建对应的记录。

## 解决方案

### 步骤 1：在 Supabase Dashboard 中执行修复脚本

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 执行以下 SQL 脚本：

```sql
-- 修复 OAuth 登录时自动创建 users 表记录的触发器
-- 当 auth.users 中创建新用户时，自动在 users 表中创建对应记录

-- 创建函数：从 auth.users 同步到 users 表
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- 从 user_metadata 中提取用户名
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1),
    '用户'
  );

  -- 插入或更新用户记录
  INSERT INTO public.users (id, email, name, role, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    'teacher',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止用户创建
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 确保触发器存在
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 步骤 2：检查 RLS 策略

确保 `public.users` 表有允许插入的策略：

```sql
-- 检查现有的策略
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 如果缺少策略，创建允许服务角色插入的策略
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT 
  WITH CHECK (true);
```

### 步骤 3：验证触发器

```sql
-- 检查触发器是否存在
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 检查函数是否存在
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### 步骤 4：测试

1. 清除浏览器缓存和 cookies
2. 重新尝试 Google/GitHub 登录
3. 检查 Supabase Dashboard > Logs 查看是否有错误

## 如果问题仍然存在

### 检查日志

1. 进入 Supabase Dashboard > **Logs** > **Postgres Logs**
2. 查找与 `handle_new_user` 相关的错误
3. 查看错误堆栈信息

### 临时禁用触发器（仅用于测试）

```sql
-- 临时禁用触发器
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- 测试 OAuth 登录

-- 重新启用触发器
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
```

### 手动创建用户记录

如果触发器仍然有问题，可以在后端 API 中手动创建用户记录（参考 `apps/api/src/auth/auth.service.ts`）。

## 常见错误

### 错误 1: `permission denied for table users`
**解决方案：** 确保触发器函数使用 `SECURITY DEFINER`，并且有适当的权限。

### 错误 2: `relation "users" does not exist`
**解决方案：** 确保 `public.users` 表已创建（运行 `database/schema.sql`）。

### 错误 3: `duplicate key value violates unique constraint`
**解决方案：** 触发器函数中已包含 `ON CONFLICT` 处理，应该可以解决。

## 验证修复

修复后，OAuth 登录流程应该：
1. ✅ Google/GitHub 授权成功
2. ✅ Supabase 在 `auth.users` 中创建用户
3. ✅ 触发器在 `public.users` 中创建对应记录
4. ✅ 用户成功登录并重定向到首页

