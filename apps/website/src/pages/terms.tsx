import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            使用条款
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
              欢迎使用 QuizFlow（"我们"、"我们的"或"本平台"）。在使用我们的服务之前，请仔细阅读本使用条款（"条款"）。
            </p>
            <p>
              通过访问或使用 QuizFlow 服务，您同意受本条款的约束。如果您不同意本条款的任何部分，请不要使用我们的服务。
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">接受条款</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              通过注册账户、访问或使用 QuizFlow 服务，您确认：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>您已阅读、理解并同意受本条款约束</li>
              <li>您已达到使用本服务的法定年龄（通常为18岁，或您所在司法管辖区的法定年龄）</li>
              <li>您有权代表自己或您所代表的实体接受本条款</li>
              <li>您提供的信息是真实、准确和完整的</li>
            </ul>
          </CardContent>
        </Card>

        {/* Description of Service */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">服务描述</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              QuizFlow 是一个基于云端的智能测验与评估平台，提供以下服务：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI 智能出题功能</li>
              <li>在线创建和管理题目、试卷</li>
              <li>H5 在线答卷功能</li>
              <li>自动评分和数据分析</li>
              <li>报告生成和导出</li>
              <li>订阅管理和团队协作功能</li>
            </ul>
            <p className="mt-4">
              我们保留随时修改、暂停或终止任何服务或功能的权利，恕不另行通知。
            </p>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">用户账户</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">账户注册</h3>
              <p>
                要使用某些功能，您需要注册一个账户。您同意：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>提供真实、准确、完整和最新的信息</li>
                <li>维护并及时更新您的账户信息</li>
                <li>对您的账户和密码的保密性负责</li>
                <li>对您账户下的所有活动负责</li>
                <li>立即通知我们任何未经授权的使用</li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">账户安全</h3>
              <p>
                您有责任维护账户信息的安全。我们不对因您未能保护账户安全而导致的任何损失负责。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">可接受使用</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>您同意不会：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>违反任何适用的法律、法规或条例</li>
              <li>侵犯他人的知识产权、隐私权或其他权利</li>
              <li>上传、发布或传输任何非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容</li>
              <li>上传包含病毒、恶意代码或其他有害技术的文件</li>
              <li>试图未经授权访问我们的系统、网络或其他用户账户</li>
              <li>干扰或破坏服务的正常运行</li>
              <li>使用自动化工具（机器人、爬虫等）访问服务，除非获得明确授权</li>
              <li>将服务用于任何非法或未经授权的目的</li>
              <li>复制、修改、分发、出售或租赁服务的任何部分</li>
              <li>反向工程、反编译或反汇编服务的任何部分</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">用户内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">内容所有权</h3>
              <p>
                您保留对您上传、创建或提交到服务的所有内容（"用户内容"）的所有权。您授予我们使用、存储、处理和显示用户内容的许可，以便提供和改进服务。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">内容责任</h3>
              <p>
                您对您的内容负责，并确保您拥有必要的权利和许可来使用、上传或分享该内容。我们不对用户内容的准确性、完整性或合法性负责。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">内容删除</h3>
              <p>
                我们保留删除任何违反本条款或我们认为不当、有害或违法的用户内容的权利，恕不另行通知。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">知识产权</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              服务及其所有内容，包括但不限于文本、图形、徽标、图标、图像、音频剪辑、数字下载、数据编译和软件，均为 QuizFlow 或其内容提供商的财产，受版权、商标和其他知识产权法保护。
            </p>
            <p>
              未经我们明确书面许可，您不得复制、修改、分发、出售或租赁服务的任何部分。
            </p>
          </CardContent>
        </Card>

        {/* Subscription and Payment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">订阅和支付</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">订阅服务</h3>
              <p>
                某些功能可能需要付费订阅。订阅费用、计费周期和功能将在您订阅时明确说明。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">自动续费</h3>
              <p>
                除非您取消订阅，否则订阅将自动续费。您可以在账户设置中随时取消订阅。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">退款政策</h3>
              <p>
                退款政策将在您购买时明确说明。一般情况下，已使用的订阅费用不予退还。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">价格变更</h3>
              <p>
                我们保留随时修改价格的权利。价格变更将在续费时生效，我们会提前通知您。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer of Warranties */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">免责声明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              服务按"现状"和"可用"的基础提供。我们不保证：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>服务将满足您的特定要求</li>
              <li>服务将不间断、及时、安全或无错误</li>
              <li>通过服务获得的结果将准确或可靠</li>
              <li>服务中的任何缺陷将被纠正</li>
            </ul>
            <p className="mt-4">
              在法律允许的最大范围内，我们明确否认所有明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权性的保证。
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">责任限制</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              在法律允许的最大范围内，QuizFlow 及其关联公司、员工、代理、合作伙伴和许可方不对以下情况承担责任：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>任何间接、偶然、特殊、后果性或惩罚性损害</li>
              <li>利润损失、数据丢失、业务中断或其他商业损害</li>
              <li>因使用或无法使用服务而产生的任何损害</li>
            </ul>
            <p className="mt-4">
              我们的总责任不超过您在引起索赔的12个月内向我们支付的金额。
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">赔偿</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              您同意赔偿、辩护并使 QuizFlow 及其关联公司、员工、代理、合作伙伴和许可方免受因以下原因引起的任何索赔、损害、损失、责任和费用（包括合理的律师费）：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>您使用或滥用服务</li>
              <li>您违反本条款</li>
              <li>您侵犯任何第三方的权利</li>
              <li>您的用户内容</li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">终止</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">由您终止</h3>
              <p>
                您可以随时通过删除账户或停止使用服务来终止您的账户。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">由我们终止</h3>
              <p>
                如果我们认为您违反了本条款，或出于任何其他原因，我们保留随时暂停或终止您的账户和访问服务的权利，恕不另行通知。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">终止后的影响</h3>
              <p>
                终止后，您访问服务的权利将立即停止。我们可能删除您的账户和内容，但不承担任何义务。终止后，本条款中旨在终止后继续有效的条款将继续有效。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">条款变更</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              我们保留随时修改本条款的权利。重大变更时，我们会在网站上发布通知，并通过电子邮件或其他方式通知您。继续使用服务即表示您接受更新后的条款。
            </p>
            <p>
              如果您不同意修改后的条款，您必须停止使用服务并删除您的账户。
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">适用法律</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              本条款受中华人民共和国法律管辖。任何争议应通过友好协商解决；协商不成的，应提交有管辖权的人民法院解决。
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
              如果您对本使用条款有任何问题，请通过以下方式联系我们：
            </p>
            <div className="space-y-2">
              <p>
                <strong>电子邮件：</strong>{' '}
                <a href="mailto:legal@quiz-flow.com" className="text-primary hover:underline">
                  legal@quiz-flow.com
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

