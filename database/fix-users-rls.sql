-- 修复 users 表的 RLS 策略
-- 允许服务角色（后端 API）插入用户记录

-- 删除可能存在的旧策略（如果存在）
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- 创建允许服务角色插入的策略
-- 使用 service role key 时，这个策略允许插入任何用户
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- 可选：允许用户通过认证插入自己的数据
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

