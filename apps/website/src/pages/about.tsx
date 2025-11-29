import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Github, Twitter, Linkedin } from 'lucide-react'
import { useTranslation } from '@quizflow/i18n'

export function About() {
  const { t } = useTranslation('website')

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('about.mission.desc')}
          </p>
        </div>

        {/* Brand Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.story.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              {t('about.story.desc')}
            </p>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.mission.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              {t('about.mission.desc')}
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.contact.title')}</CardTitle>
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
            <CardTitle className="text-2xl">{t('footer.legal')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                to="/privacy"
                className="block text-primary hover:underline"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                to="/terms"
                className="block text-primary hover:underline"
              >
                {t('footer.terms')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

