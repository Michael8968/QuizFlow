import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Home } from '@/pages/home'
import { Features } from '@/pages/features'
import { UseCases } from '@/pages/use-cases'
import { Pricing } from '@/pages/pricing'
import { About } from '@/pages/about'
import { FAQ } from '@/pages/faq'
import { Login } from '@/pages/auth/login'
import { Register } from '@/pages/auth/register'
import { AuthCallback } from '@/pages/auth/callback'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

