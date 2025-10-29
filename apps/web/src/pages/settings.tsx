import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { User, CreditCard, Bell, Shield, HelpCircle } from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">设置</h1>
        <p className="mt-2 text-gray-600">
          管理您的账户设置和偏好
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 账户信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                账户信息
              </CardTitle>
              <CardDescription>
                更新您的个人信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <Input defaultValue="张三" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <Input type="email" defaultValue="zhangsan@example.com" />
                </div>
              </div>
              <Button>保存更改</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                安全设置
              </CardTitle>
              <CardDescription>
                管理您的密码和安全选项
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <Input type="password" placeholder="输入当前密码" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <Input type="password" placeholder="输入新密码" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <Input type="password" placeholder="再次输入新密码" />
              </div>
              <Button>更新密码</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                通知设置
              </CardTitle>
              <CardDescription>
                管理您接收的通知类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">邮件通知</p>
                  <p className="text-sm text-gray-600">接收重要更新和报告</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">新答卷提醒</p>
                  <p className="text-sm text-gray-600">学生提交答卷时通知</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">系统更新</p>
                  <p className="text-sm text-gray-600">产品功能更新通知</p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 订阅信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                订阅信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">免费版</Badge>
                <p className="text-sm text-gray-600">
                  当前使用免费版本
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>题目数量</span>
                  <span>100/100</span>
                </div>
                <div className="flex justify-between">
                  <span>试卷数量</span>
                  <span>1/1</span>
                </div>
                <div className="flex justify-between">
                  <span>AI 出题</span>
                  <span>不可用</span>
                </div>
              </div>
              <Button className="w-full">升级到专业版</Button>
            </CardContent>
          </Card>

          {/* 帮助与支持 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                帮助与支持
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                使用指南
              </Button>
              <Button variant="outline" className="w-full justify-start">
                常见问题
              </Button>
              <Button variant="outline" className="w-full justify-start">
                联系支持
              </Button>
            </CardContent>
          </Card>

          {/* 危险操作 */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">危险操作</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                删除账户
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                此操作不可撤销
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
