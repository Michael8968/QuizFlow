import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null
    const maxRetries = 5

    const handleAuthCallback = async () => {
      try {
        // 检查 URL 中是否有错误参数
        const urlParams = new URLSearchParams(window.location.search)
        const errorParam = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')
        const code = urlParams.get('code')

        console.log('回调 URL 参数:', {
          error: errorParam,
          errorDescription,
          code: code ? '存在' : '不存在',
          fullUrl: window.location.href,
        })

        if (errorParam) {
          console.error('OAuth 错误:', errorParam, errorDescription)
          setError(`认证失败: ${errorDescription || errorParam}`)
          toast({
            title: '认证失败',
            description: errorDescription || errorParam,
            variant: 'destructive',
          })
          return
        }

        // 如果 URL 中有 code 参数，说明 OAuth 提供商已经授权，但 Supabase 处理时出错
        if (code && !errorParam) {
          console.log('检测到授权码，等待 Supabase 处理...')
        }

        // 监听认证状态变化
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session ? '有 session' : '无 session')
            
            if (event === 'SIGNED_IN' && session) {
              const { user, access_token } = session

              // 从 Supabase 用户信息中提取数据
              const userData = {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.user_metadata?.user_name ||
                      user.email?.split('@')[0] || 
                      '用户',
                role: 'teacher' as const,
                plan: 'free' as const,
                created_at: user.created_at,
                updated_at: user.updated_at || user.created_at,
              }

              // 保存用户信息和 token
              setUser(userData)
              setToken(access_token)

              // 取消订阅
              if (authSubscription) {
                authSubscription.unsubscribe()
              }

              toast({
                title: '登录成功',
                description: '欢迎回来！',
              })

              // 重定向到首页
              navigate('/')
            } else if (event === 'SIGNED_OUT') {
              setError('登录已取消')
              toast({
                title: '登录已取消',
                variant: 'destructive',
              })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              // Token 刷新时也更新
              setToken(session.access_token)
            }
          }
        )

        subscription = authSubscription

        // 等待一下，让 Supabase 处理 URL hash 中的参数
        await new Promise(resolve => setTimeout(resolve, 500))

        // 尝试获取当前 session（带重试机制）
        const tryGetSession = async (attempt: number): Promise<void> => {
          try {
            const { data: { session }, error: authError } = await supabase.auth.getSession()

            if (authError) {
              console.error(`获取 session 错误 (尝试 ${attempt}/${maxRetries}):`, {
                message: authError.message,
                status: authError.status,
                name: authError.name,
              })
              
              // 如果是 500 错误或网络错误，可能是后端还在处理，重试
              if (attempt < maxRetries && (authError.status === 500 || authError.status === 0 || !authError.status)) {
                const delay = Math.min(1000 * attempt, 5000) // 最多等待 5 秒
                console.log(`等待 ${delay}ms 后重试...`)
                await new Promise(resolve => setTimeout(resolve, delay))
                return tryGetSession(attempt + 1)
              }
              
              // 如果是 500 错误且重试次数用完，提供更详细的错误信息
              if (authError.status === 500) {
                throw new Error(
                  '服务器错误 (500)。这通常是因为：\n' +
                  '1. Supabase 数据库配置问题\n' +
                  '2. 数据库触发器或函数出错\n' +
                  '3. RLS 策略配置问题\n\n' +
                  '请检查 Supabase Dashboard > Logs 查看详细错误信息。'
                )
              }
              
              throw authError
            }

            if (session) {
              const { user, access_token } = session

              // 从 Supabase 用户信息中提取数据
              const userData = {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.user_metadata?.user_name ||
                      user.email?.split('@')[0] || 
                      '用户',
                role: 'teacher' as const,
                plan: 'free' as const,
                created_at: user.created_at,
                updated_at: user.updated_at || user.created_at,
              }

              // 保存用户信息和 token
              setUser(userData)
              setToken(access_token)

              // 取消订阅
              if (subscription) {
                subscription.unsubscribe()
              }

              toast({
                title: '登录成功',
                description: '欢迎回来！',
              })

              // 重定向到首页
              navigate('/')
            } else {
              // 如果没有 session，检查 URL hash 中是否有 token
              const hashParams = new URLSearchParams(window.location.hash.substring(1))
              const accessToken = hashParams.get('access_token')
              const errorHash = hashParams.get('error')

              if (errorHash) {
                const errorDescription = hashParams.get('error_description')
                setError(`认证失败: ${errorDescription || errorHash}`)
                toast({
                  title: '认证失败',
                  description: errorDescription || errorHash,
                  variant: 'destructive',
                })
              } else if (accessToken && attempt < maxRetries) {
                // 如果有 token 但还没有 session，等待一下再重试
                console.log('检测到 access_token，等待 Supabase 处理...')
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
                return tryGetSession(attempt + 1)
              } else {
                // 如果没有 session，检查是否还在处理中
                if (attempt < maxRetries) {
                  const delay = Math.min(1000 * (attempt + 1), 5000)
                  console.log(`未找到 session，等待 ${delay}ms 后重试...`)
                  await new Promise(resolve => setTimeout(resolve, delay))
                  return tryGetSession(attempt + 1)
                } else {
                  const errorMsg = '未找到会话信息。这可能是因为：\n1. Supabase 服务器处理超时\n2. 数据库配置问题\n\n请重试登录或检查 Supabase Dashboard 中的日志。'
                  setError(errorMsg)
                  toast({
                    title: '认证失败',
                    description: errorMsg,
                    variant: 'destructive',
                  })
                }
              }
            }
          } catch (sessionError: any) {
            // 如果获取 session 时出错，也进行重试
            if (attempt < maxRetries && (sessionError.status === 500 || !sessionError.status)) {
              const delay = Math.min(1000 * attempt, 5000)
              console.log(`Session 错误，等待 ${delay}ms 后重试...`)
              await new Promise(resolve => setTimeout(resolve, delay))
              return tryGetSession(attempt + 1)
            }
            throw sessionError
          }
        }

        await tryGetSession(1)
      } catch (err: any) {
        console.error('认证回调错误:', {
          message: err.message,
          status: err.status,
          name: err.name,
          stack: err.stack,
        })
        
        // 提供更详细的错误信息
        let errorMessage = err.message || '认证失败'
        if (err.status === 500 || errorMessage.includes('500')) {
          errorMessage = '服务器错误 (500)。这通常是因为：\n\n' +
            '1. Supabase 数据库配置问题\n' +
            '2. 数据库触发器或函数出错\n' +
            '3. RLS (Row Level Security) 策略配置问题\n' +
            '4. 用户表结构不匹配\n\n' +
            '请检查：\n' +
            '- Supabase Dashboard > Logs 查看详细错误\n' +
            '- 确认数据库 schema 已正确初始化\n' +
            '- 检查是否有数据库触发器导致错误'
        }
        
        setError(errorMessage)
        toast({
          title: '认证失败',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }

    handleAuthCallback()

    // 清理函数
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [navigate, setUser, setToken, toast])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">认证失败</h1>
          <p className="text-gray-600 mb-4 whitespace-pre-line">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            返回登录页面
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">正在处理认证...</p>
      </div>
    </div>
  )
}

