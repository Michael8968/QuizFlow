import { createClient } from '@supabase/supabase-js'

// 环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证必需的环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '缺少必需的环境变量：VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。请检查 .env 文件配置。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

