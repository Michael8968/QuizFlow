import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Github, Twitter, Linkedin } from 'lucide-react'

export function About() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            关于 QuizFlow
          </h1>
          <p className="text-xl text-gray-600">
            让测验管理变得简单高效
          </p>
        </div>

        {/* Brand Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">品牌故事</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              QuizFlow 诞生于对教育技术革新的追求。我们观察到，无论是教育机构、教师个人还是企业培训部门，在组织测验和评估时都面临着相似的挑战：出题耗时、阅卷繁琐、数据分析困难。
            </p>
            <p>
              基于这些痛点，我们开发了 QuizFlow —— 一个集AI智能出题、在线答卷、自动评分和数据分析于一体的智能测验平台。我们的使命是让每一个教育工作者都能轻松创建高质量的测验，并通过数据洞察提升教学效果。
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">愿景</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              成为全球领先的智能测验与评估平台，通过技术创新推动教育进步，让知识评估变得更加智能、高效和公平。
            </p>
            <p>
              我们相信，通过AI技术和数据分析，可以更好地理解学习过程，帮助教育者做出更明智的决策，最终提升教育质量。
            </p>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">团队简介</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              QuizFlow 由一群热爱教育技术的工程师、产品经理和教育专家组成。我们来自不同的背景，但都致力于用技术改善教育体验。
            </p>
            <p className="text-gray-700">
              我们的团队在AI、大数据、教育技术等领域拥有丰富的经验，不断探索和创新，为用户提供更好的产品和服务。
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">联系我们</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:contact@quiz-flow.com"
                  className="text-primary hover:underline"
                >
                  contact@quiz-flow.com
                </a>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">法律信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                to="/privacy"
                className="block text-primary hover:underline"
              >
                隐私政策
              </Link>
              <Link
                to="/terms"
                className="block text-primary hover:underline"
              >
                使用条款
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

