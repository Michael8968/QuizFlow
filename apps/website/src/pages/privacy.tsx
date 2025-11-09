import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Privacy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            隐私政策
          </h1>
          <p className="text-xl text-gray-600">
            最后更新日期：{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">引言</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              QuizFlow（"我们"、"我们的"或"本平台"）非常重视您的隐私。本隐私政策说明了我们如何收集、使用、存储和保护您在使用 QuizFlow 服务时提供的个人信息。
            </p>
            <p>
              使用我们的服务，即表示您同意本隐私政策的条款。如果您不同意本政策，请勿使用我们的服务。
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">我们收集的信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. 您主动提供的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>账户注册信息：姓名、电子邮件地址、密码等</li>
                <li>个人资料信息：头像、个人简介等</li>
                <li>内容信息：您创建的题目、试卷、答案等</li>
                <li>支付信息：订阅服务时的支付相关信息（由第三方支付服务商处理）</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">2. 自动收集的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>设备信息：设备类型、操作系统、浏览器类型等</li>
                <li>使用数据：访问时间、页面浏览记录、功能使用情况等</li>
                <li>日志信息：IP地址、访问日志、错误日志等</li>
                <li>Cookie和类似技术：用于改善用户体验和提供个性化服务</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">信息使用方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>我们使用收集的信息用于以下目的：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的注册、订阅和交易</li>
              <li>发送服务通知、更新和安全提醒</li>
              <li>提供客户支持和技术支持</li>
              <li>分析使用情况以改善用户体验</li>
              <li>检测、预防和解决技术问题或安全威胁</li>
              <li>遵守法律法规要求</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">信息共享与披露</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>我们不会出售、交易或出租您的个人信息。我们可能在以下情况下共享您的信息：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>服务提供商：</strong>与帮助我们运营服务的第三方服务商（如云存储、支付处理、分析服务等）</li>
              <li><strong>法律要求：</strong>当法律、法规或政府要求时</li>
              <li><strong>保护权利：</strong>为保护我们的权利、财产或安全，或保护用户或公众的权利、财产或安全</li>
              <li><strong>业务转让：</strong>在合并、收购或资产转让的情况下</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">数据安全</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              我们采用行业标准的安全措施来保护您的个人信息，包括：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>数据加密传输（HTTPS/TLS）</li>
              <li>数据加密存储</li>
              <li>访问控制和身份验证</li>
              <li>定期安全审计和漏洞扫描</li>
              <li>员工安全培训</li>
            </ul>
            <p className="mt-4">
              尽管我们采取了合理的安全措施，但请注意，没有任何互联网传输或存储方法是100%安全的。我们无法保证信息的绝对安全。
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">您的权利</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>根据适用的数据保护法律，您享有以下权利：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>访问权：</strong>查看我们持有的关于您的个人信息</li>
              <li><strong>更正权：</strong>更正不准确或不完整的个人信息</li>
              <li><strong>删除权：</strong>要求删除您的个人信息（在法律允许的范围内）</li>
              <li><strong>限制处理权：</strong>限制我们处理您的个人信息</li>
              <li><strong>数据可携权：</strong>以结构化、常用格式获取您的数据</li>
              <li><strong>反对权：</strong>反对我们处理您的个人信息</li>
            </ul>
            <p className="mt-4">
              要行使这些权利，请通过 <a href="mailto:privacy@quiz-flow.com" className="text-primary hover:underline">privacy@quiz-flow.com</a> 联系我们。
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Cookie 和类似技术</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              我们使用 Cookie 和类似技术来改善用户体验、分析使用情况并提供个性化服务。您可以通过浏览器设置管理 Cookie 偏好，但这可能影响某些功能的正常使用。
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">儿童隐私</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果我们发现收集了此类信息，我们将立即删除。
            </p>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">国际数据传输</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              您的信息可能被传输到您所在国家/地区以外的地方进行处理和存储。我们确保采取适当的安全措施，并遵守适用的数据保护法律。
            </p>
          </CardContent>
        </Card>

        {/* Policy Changes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">政策变更</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              我们可能会不时更新本隐私政策。重大变更时，我们会在网站上发布通知，并通过电子邮件或其他方式通知您。继续使用我们的服务即表示您接受更新后的政策。
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">联系我们</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              如果您对本隐私政策有任何问题、意见或投诉，请通过以下方式联系我们：
            </p>
            <div className="space-y-2">
              <p>
                <strong>电子邮件：</strong>{' '}
                <a href="mailto:privacy@quiz-flow.com" className="text-primary hover:underline">
                  privacy@quiz-flow.com
                </a>
              </p>
              <p>
                <strong>一般咨询：</strong>{' '}
                <a href="mailto:contact@quiz-flow.com" className="text-primary hover:underline">
                  contact@quiz-flow.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

