import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useTranslation } from '@quizflow/i18n'

export function FAQ() {
  const { t } = useTranslation('website')

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']
  const faqs = faqKeys.map(key => ({
    question: t(`faq.${key}.q`),
    answer: t(`faq.${key}.a`),
  }))

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to your questions
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Have more questions? We're here to help
          </p>
          <a
            href="mailto:contact@quiz-flow.com"
            className="text-primary hover:underline font-medium"
          >
            contact@quiz-flow.com
          </a>
        </div>
      </div>
    </div>
  )
}

