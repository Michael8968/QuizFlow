import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, ChevronDown, ExternalLink } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout, setUser, setToken } = useAuthStore()

  // 获取 web 应用 URL
  const webAppUrl = import.meta.env.VITE_WEB_URL || 'http://localhost:3000'

  // 同步 Supabase 认证状态
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // 如果 Supabase 有 session 但 store 中没有用户，同步状态
          if (!user) {
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.user_metadata?.user_name ||
                    session.user.email?.split('@')[0] || 
                    '用户',
              role: 'teacher' as const,
              plan: 'free' as const,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            }
            setUser(userData)
            setToken(session.access_token)
          }
        } else if (!session && user) {
          // 如果 Supabase 没有 session 但 store 中有用户，清除状态
          logout()
        }
      } catch (error) {
        console.error('检查认证状态失败:', error)
      }
    }

    checkAuthState()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        logout()
      } else if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 
                session.user.user_metadata?.name || 
                session.user.user_metadata?.user_name ||
                session.user.email?.split('@')[0] || 
                '用户',
          role: 'teacher' as const,
          plan: 'free' as const,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        }
        setUser(userData)
        setToken(session.access_token)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, logout, setUser, setToken])

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      logout()
      setUserMenuOpen(false)
      navigate('/')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  // 跳转到 web 应用
  const handleGoToApp = () => {
    window.open(webAppUrl, '_blank')
  }

  const navItems = [
    { name: '首页', path: '/' },
    { name: '功能', path: '/features' },
    { name: '使用场景', path: '/use-cases' },
    { name: '价格', path: '/pricing' },
    { name: '关于我们', path: '/about' },
    { name: '常见问题', path: '/faq' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">QuizFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <button
                      onClick={handleGoToApp}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>进入应用</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">免费试用</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t">
              {user ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleGoToApp()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>进入应用</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      登录
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">免费试用</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

