import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation, LanguageSwitcher } from '@quizflow/i18n'

const navigationItems = [
  { key: 'nav.dashboard', href: '/', icon: LayoutDashboard, color: 'text-blue-600' },
  { key: 'nav.questions', href: '/questions', icon: BookOpen, color: 'text-green-600' },
  { key: 'nav.papers', href: '/papers', icon: FileText, color: 'text-orange-600' },
  { key: 'nav.reports', href: '/reports', icon: BarChart3, color: 'text-purple-600' },
  { key: 'nav.settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
]

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation('common')

  const isProfessional = ['professional', 'institution', 'ai_enhanced'].includes(user?.plan || '')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">QuizFlow</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.href)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('mr-3 h-5 w-5', !isActive && item.color)} />
                  {t(item.key)}
                </button>
              )
            })}
          </nav>
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center p-3 rounded-xl bg-gray-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  {isProfessional && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs px-1.5 py-0">
                      <Zap className="w-2.5 h-2.5" />
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth:logout.title')}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-100 shadow-sm">
          <div className="flex h-16 items-center px-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">QuizFlow</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('mr-3 h-5 w-5', !isActive && item.color)} />
                  {t(item.key)}
                </button>
              )
            })}
          </nav>
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  {isProfessional && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs px-1.5 py-0">
                      <Zap className="w-2.5 h-2.5" />
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth:logout.title')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-3 lg:gap-x-4">
              <LanguageSwitcher className="flex items-center" />
              {isProfessional ? (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 font-medium">
                  <Zap className="w-3 h-3 mr-1" />
                  {user?.plan === 'professional' ? t('settings:subscription.pro') :
                   user?.plan === 'institution' ? t('settings:subscription.enterprise') : 'AI Enhanced'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500 border-gray-300">
                  {t('settings:subscription.free')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
