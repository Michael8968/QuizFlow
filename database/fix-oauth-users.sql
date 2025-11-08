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

-- 创建触发器：当 auth.users 中插入新用户时触发
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 如果触发器已存在但需要更新，可以使用以下命令：
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

