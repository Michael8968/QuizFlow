import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

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
            <Link to="/login">
              <Button variant="ghost" size="sm">
                登录
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">免费试用</Button>
            </Link>
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
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  登录
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">免费试用</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

