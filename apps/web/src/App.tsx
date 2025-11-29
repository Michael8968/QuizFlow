import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ToastProvider } from '@/hooks/use-toast'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Layout } from '@/components/layout/layout'
import { PageLoader } from '@/components/ui/page-loader'

// 路由懒加载 - 减少首屏加载体积
const Dashboard = lazy(() => import('@/pages/dashboard').then(m => ({ default: m.Dashboard })))
const Questions = lazy(() => import('@/pages/questions').then(m => ({ default: m.Questions })))
const Papers = lazy(() => import('@/pages/papers').then(m => ({ default: m.Papers })))
const Reports = lazy(() => import('@/pages/reports').then(m => ({ default: m.Reports })))
const Settings = lazy(() => import('@/pages/settings/index').then(m => ({ default: m.Settings })))

// 认证页面懒加载
const Login = lazy(() => import('@/pages/auth/login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/auth/register').then(m => ({ default: m.Register })))
const AuthCallback = lazy(() => import('@/pages/auth/callback').then(m => ({ default: m.AuthCallback })))

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="questions" element={<Questions />} />
                <Route path="papers" element={<Papers />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
