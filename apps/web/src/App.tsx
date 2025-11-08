import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ToastProvider } from '@/hooks/use-toast'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Layout } from '@/components/layout/layout'
import { Dashboard } from '@/pages/dashboard'
import { Questions } from '@/pages/questions'
import { Papers } from '@/pages/papers'
import { Reports } from '@/pages/reports'
import { Settings } from '@/pages/settings/index'
import { Login } from '@/pages/auth/login'
import { Register } from '@/pages/auth/register'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="questions" element={<Questions />} />
              <Route path="papers" element={<Papers />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
