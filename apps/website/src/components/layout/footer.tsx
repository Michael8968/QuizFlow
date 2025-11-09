import { Link } from 'react-router-dom'
import { Mail, Github, Twitter } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">QuizFlow</h3>
            <p className="text-sm text-gray-400">
              AI驱动的智能题库与评估平台
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">产品</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  功能
                </Link>
              </li>
              <li>
                <Link to="/use-cases" className="hover:text-white transition-colors">
                  使用场景
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  价格
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">公司</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  常见问题
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  使用条款
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">联系我们</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@quiz-flow.com"
                  className="flex items-center space-x-2 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>contact@quiz-flow.com</span>
                </a>
              </li>
              <li className="flex items-center space-x-4">
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© {currentYear} QuizFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

