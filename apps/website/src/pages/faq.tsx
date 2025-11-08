import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FAQ() {
  const faqs = [
    {
      question: '免费版有哪些功能限制？',
      answer:
        '免费版支持最多50道题目和10份试卷，包含基础报告分析和H5在线答卷功能。如果您需要更多功能，可以升级到专业版或机构版。',
    },
    {
      question: '专业版和机构版有什么区别？',
      answer:
        '专业版适合个人教师和中小型机构，包含AI智能出题、高级报告分析等功能。机构版在此基础上增加了团队协作、API访问、自定义品牌和专属客服等企业级功能。',
    },
    {
      question: '可以随时取消订阅吗？',
      answer:
        '是的，您可以随时在账户设置中取消订阅。取消后，您仍然可以使用服务直到当前计费周期结束，不会立即停止服务。',
    },
    {
      question: '支持哪些支付方式？',
      answer:
        '我们支持支付宝、微信支付、银行卡等多种支付方式。年付用户还可以享受17%的优惠折扣。',
    },
    {
      question: '有退款政策吗？',
      answer:
        '我们提供30天退款保证。如果您在订阅后30天内对服务不满意，可以联系客服申请全额退款，无需任何理由。',
    },
    {
      question: '数据安全如何保障？',
      answer:
        '我们采用银行级别的数据加密技术，所有数据都经过加密存储和传输。我们严格遵守数据保护法规，不会向第三方泄露您的数据。',
    },
    {
      question: '支持批量导入题目吗？',
      answer:
        '是的，我们支持从Excel、Word、CSV等格式批量导入题目。您可以在题库管理页面使用导入功能，系统会自动识别题目格式。',
    },
    {
      question: 'H5答卷支持哪些设备？',
      answer:
        'H5答卷系统完美适配所有主流移动设备，包括iPhone、Android手机、iPad、Android平板等。答题者可以通过任何支持现代浏览器的设备参与答题。',
    },
    {
      question: 'AI出题的准确度如何？',
      answer:
        '我们的AI出题系统基于先进的自然语言处理技术，经过大量教育数据训练。生成的题目质量高，符合教学要求，您也可以对AI生成的题目进行编辑和优化。',
    },
    {
      question: '可以自定义品牌吗？',
      answer:
        '机构版用户可以自定义品牌，包括Logo、颜色主题、域名等。专业版和免费版暂不支持此功能。',
    },
    {
      question: '有API接口吗？',
      answer:
        '机构版提供完整的RESTful API接口，支持题目管理、试卷管理、成绩查询等功能。您可以通过API将QuizFlow集成到自己的系统中。',
    },
    {
      question: '如何获得技术支持？',
      answer:
        '我们提供多种支持渠道：免费版用户可以通过社区论坛获得帮助；专业版用户享有优先邮件支持；机构版用户享有专属客服支持。',
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            常见问题
          </h1>
          <p className="text-xl text-gray-600">
            找到您关心的问题答案
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
            还有其他问题？我们很乐意为您解答
          </p>
          <a
            href="mailto:contact@quizflow.com"
            className="text-primary hover:underline font-medium"
          >
            contact@quizflow.com
          </a>
        </div>
      </div>
    </div>
  )
}

