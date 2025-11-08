import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function Register() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setOauthLoading(provider)
      
      const redirectTo = `${window.location.origin}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('OAuth 错误详情:', {
          message: error.message,
          status: error.status,
          provider,
          redirectTo,
        })
        
        // 提供更详细的错误信息
        let errorMessage = error.message || '未知错误'
        if (error.status === 400) {
          errorMessage = `OAuth 配置错误。请检查：
1. Supabase Dashboard 中是否已启用 ${provider} 提供商
2. 是否已配置 ${provider} 的 Client ID 和 Secret
3. 重定向 URL (${redirectTo}) 是否已添加到允许列表中`
        }
        
        alert(`登录失败: ${errorMessage}`)
        setOauthLoading(null)
        return
      }

      // 如果成功，data.url 应该存在，用户会被重定向
      if (!data?.url) {
        console.warn('OAuth 响应中没有 URL，可能需要检查配置')
      }
    } catch (error: any) {
      console.error('OAuth 登录异常:', error)
      alert(`登录失败: ${error.message || '未知错误'}`)
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string
      const terms = formData.get('terms')

      // 验证表单
      if (!name || !email || !password || !confirmPassword) {
        setError('请填写所有必填字段')
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('两次输入的密码不一致')
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        setError('密码至少需要8个字符')
        setIsLoading(false)
        return
      }

      if (!terms) {
        setError('请同意使用条款和隐私政策')
        setIsLoading(false)
        return
      }

      // 使用 Supabase 注册用户
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
        },
      })

      if (signUpError) {
        console.error('注册错误:', signUpError)
        let errorMessage = signUpError.message || '注册失败'
        
        // 提供更友好的错误信息
        if (signUpError.message.includes('already registered')) {
          errorMessage = '该邮箱已被注册，请使用其他邮箱或直接登录'
        } else if (signUpError.message.includes('invalid email')) {
          errorMessage = '请输入有效的邮箱地址'
        } else if (signUpError.message.includes('Password')) {
          errorMessage = '密码不符合要求，请确保密码至少8个字符'
        }
        
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError('注册失败，请重试')
        setIsLoading(false)
        return
      }

      // 根据 Supabase 返回的用户数据结构提取信息
      // 参考: https://tjyvwucvhkfltwvdqflu.supabase.co/auth/v1/user 返回的数据结构
      const user = data.user
      
      // 从 user_metadata 中提取姓名，优先级：full_name > name > email 前缀
      const userName = 
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '用户'

      // 构建用户数据对象
      const userData = {
        id: user.id,
        email: user.email || '',
        name: userName,
        role: 'teacher' as const,
        plan: 'free' as const,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      }

      // 如果有 session，说明用户已自动登录（如果 Supabase 配置了自动确认）
      if (data.session) {
        setUser(userData)
        setToken(data.session.access_token)
        navigate('/')
      } else {
        // 如果没有 session，可能需要邮箱确认
        // 显示成功消息，提示用户检查邮箱
        alert('注册成功！请检查您的邮箱并点击确认链接以完成注册。')
        navigate('/login')
      }
    } catch (err: any) {
      console.error('注册异常:', err)
      setError(err.message || '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">免费注册</CardTitle>
          <CardDescription>
            开始您的 QuizFlow 之旅，免费试用所有功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                姓名
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="您的姓名"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少8个字符"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="mt-1 rounded"
                required
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                我同意{' '}
                <a href="#" className="text-primary hover:underline">
                  使用条款
                </a>{' '}
                和{' '}
                <a href="#" className="text-primary hover:underline">
                  隐私政策
                </a>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || oauthLoading !== null}>
              {isLoading ? '注册中...' : '创建账户'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null || isLoading}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {oauthLoading === 'google' ? '加载中...' : 'Google'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleOAuthLogin('github')}
                disabled={oauthLoading !== null || isLoading}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {oauthLoading === 'github' ? '加载中...' : 'GitHub'}
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">免费试用</p>
                <p>注册后即可免费使用所有功能，无需信用卡</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            已有账户？{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

