import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { User, CreditCard, Bell, Shield, HelpCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/api'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Question, Paper } from '@/types'

interface ProfileFormData {
  name: string
  email: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationSettings {
  emailNotifications: boolean
  newAnswerAlerts: boolean
  systemUpdates: boolean
}

export function Settings() {
  const { user, isLoading } = useAuth()
  const { setUser, logout } = useAuthStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // 通知设置状态
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    newAnswerAlerts: true,
    systemUpdates: false,
  })
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  // 密码表单
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm<PasswordFormData>()

  const newPassword = watchPassword('newPassword')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  // 获取用户统计数据
  const { data: questionsData } = useQuery<{ data?: Question[]; count?: number }>({
    queryKey: ['questions', 'settings'],
    queryFn: async () => {
      return await api.getQuestions({ limit: 1000 }) as { data?: Question[]; count?: number }
    },
    enabled: !!user,
  })

  const { data: papersData } = useQuery<Paper[]>({
    queryKey: ['papers', 'settings'],
    queryFn: async () => {
      const response = await api.getPapers() as Paper[]
      return response || []
    },
    enabled: !!user,
  })

  // 计算使用量限制（根据套餐）
  const usageLimits = useMemo(() => {
    const plan = user?.plan || 'free'
    
    // 从环境变量读取套餐限制配置
    const defaultLimits = {
      free: { questions: 100, papers: 10, aiEnabled: false },
      professional: { questions: 1000, papers: 100, aiEnabled: true },
      institution: { questions: 10000, papers: 1000, aiEnabled: true },
      ai_enhanced: { questions: 5000, papers: 500, aiEnabled: true },
    }
    
    let limits = defaultLimits
    
    // 如果环境变量中有配置，则使用环境变量的配置
    const envLimits = import.meta.env.VITE_PLAN_LIMITS
    if (envLimits) {
      try {
        const parsedLimits = JSON.parse(envLimits)
        limits = { ...defaultLimits, ...parsedLimits }
      } catch (error) {
        console.error('解析套餐限制配置失败，使用默认配置:', error)
      }
    }
    
    return limits[plan as keyof typeof limits] || limits.free
  }, [user?.plan])

  // 当前使用量（只统计当前用户的数据）
  const currentUsage = useMemo(() => {
    const allQuestions = questionsData?.data || []
    const allPapers = papersData || []
    
    // 权限过滤：只统计当前用户的题目和试卷
    const userQuestions = user ? allQuestions.filter(q => q.user_id === user.id) : []
    const userPapers = user ? allPapers.filter(p => p.user_id === user.id) : []
    
    const questionCount = userQuestions.length || questionsData?.count || 0
    const paperCount = userPapers.length
    
    return {
      questions: questionCount,
      papers: paperCount,
    }
  }, [questionsData, papersData, user])

  // 加载用户通知设置
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
      })
      
      // 从用户元数据加载通知设置
      ;(async () => {
        try {
          const { data: authData } = await supabase.auth.getUser()
          const prefsFromMetadata = authData?.user?.user_metadata?.preferences as NotificationSettings | undefined
          
          if (prefsFromMetadata) {
            setNotifications(prefsFromMetadata)
          }
        } catch (error) {
          console.error('加载通知设置失败:', error)
        }
      })()
    }
  }, [user, reset])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">设置</h1>
          <p className="mt-2 text-gray-600">管理您的账户设置和偏好</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast({
        title: '错误',
        description: '未找到用户信息',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      // 更新 Supabase Auth 中的用户信息
      const updateData: { email?: string; data?: { name: string } } = {}

      if (data.email !== user.email) {
        updateData.email = data.email
      }

      if (data.name !== user.name) {
        updateData.data = { name: data.name }
      }

      // 更新 auth 用户信息
      if (Object.keys(updateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updateData)

        if (authError) {
          throw authError
        }
      }

      // 更新 users 表中的信息
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: data.name,
          email: data.email,
        })
        .eq('id', user.id)

      if (dbError) {
        throw dbError
      }

      // 更新本地 store 中的用户信息
      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email,
        updated_at: new Date().toISOString(),
      }
      setUser(updatedUser)

      toast({
        title: '保存成功',
        description: '您的账户信息已更新',
      })
    } catch (error: any) {
      console.error('更新用户信息失败:', error)
      toast({
        title: '保存失败',
        description: error.message || '更新账户信息时出错，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 更新密码
  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) {
      toast({
        title: '错误',
        description: '未找到用户信息',
        variant: 'destructive',
      })
      return
    }

    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: '错误',
        description: '新密码和确认密码不匹配',
        variant: 'destructive',
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      // 验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (signInError) {
        throw new Error('当前密码不正确')
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      resetPassword()
      toast({
        title: '密码更新成功',
        description: '您的密码已成功更新',
      })
    } catch (error: any) {
      console.error('更新密码失败:', error)
      toast({
        title: '更新失败',
        description: error.message || '更新密码时出错，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // 保存通知设置
  const handleSaveNotifications = async () => {
    if (!user) return

    setIsSavingNotifications(true)
    try {
      // 将通知设置保存到Supabase Auth的用户元数据中
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          preferences: notifications,
        },
      })

      if (authError) {
        throw authError
      }

      // 更新本地用户数据
      const updatedUser = {
        ...user,
        preferences: notifications,
      } as any
      setUser(updatedUser)

      toast({
        title: '保存成功',
        description: '通知设置已更新',
      })
    } catch (error: any) {
      console.error('保存通知设置失败:', error)
      toast({
        title: '保存失败',
        description: error.message || '保存通知设置时出错，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSavingNotifications(false)
    }
  }

  // 删除账户
  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeletingAccount(true)
    try {
      // 注意：前端客户端没有admin权限，需要通过后端API删除
      // 这里先删除数据库中的用户记录（会级联删除相关数据）
      // 然后提示用户联系支持删除Auth用户，或者通过API调用后端
      
      // 删除users表中的记录（会级联删除questions、papers等）
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (dbError) {
        throw dbError
      }

      // 登出并跳转到登录页
      logout()
      navigate('/login')
      
      toast({
        title: '账户已删除',
        description: '您的账户数据已删除。如需完全删除认证信息，请联系支持。',
      })
    } catch (error: any) {
      console.error('删除账户失败:', error)
      toast({
        title: '删除失败',
        description: error.message || '删除账户时出错，请稍后重试或联系支持',
        variant: 'destructive',
      })
    } finally {
      setIsDeletingAccount(false)
      setShowDeleteDialog(false)
    }
  }

  // 处理帮助链接
  const handleHelpClick = (type: 'guide' | 'faq' | 'support') => {
    const links = {
      guide: 'https://docs.quizflow.com/guide',
      faq: 'https://docs.quizflow.com/faq',
      support: 'mailto:support@quizflow.com',
    }
    window.open(links[type], '_blank')
  }

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
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      姓名
                    </label>
                    <Input
                      {...register('name', {
                        required: '姓名不能为空',
                        minLength: {
                          value: 1,
                          message: '姓名至少需要1个字符',
                        },
                      })}
                      disabled={isSaving}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱
                    </label>
                    <Input
                      type="email"
                      {...register('email', {
                        required: '邮箱不能为空',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: '请输入有效的邮箱地址',
                        },
                      })}
                      disabled={isSaving}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? '保存中...' : '保存更改'}
                </Button>
              </form>
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
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      当前密码
                    </label>
                    <Input
                      type="password"
                      placeholder="输入当前密码"
                      {...registerPassword('currentPassword', {
                        required: '请输入当前密码',
                      })}
                      disabled={isUpdatingPassword}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      新密码
                    </label>
                    <Input
                      type="password"
                      placeholder="输入新密码"
                      {...registerPassword('newPassword', {
                        required: '请输入新密码',
                        minLength: {
                          value: 6,
                          message: '密码至少需要6个字符',
                        },
                      })}
                      disabled={isUpdatingPassword}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      确认新密码
                    </label>
                    <Input
                      type="password"
                      placeholder="再次输入新密码"
                      {...registerPassword('confirmPassword', {
                        required: '请确认新密码',
                        validate: (value) =>
                          value === newPassword || '密码不匹配',
                      })}
                      disabled={isUpdatingPassword}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={isUpdatingPassword} className="mt-4">
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    '更新密码'
                  )}
                </Button>
              </form>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">邮件通知</p>
                    <p className="text-sm text-gray-600">接收重要更新和报告</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">新答卷提醒</p>
                    <p className="text-sm text-gray-600">学生提交答卷时通知</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newAnswerAlerts}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        newAnswerAlerts: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">系统更新</p>
                    <p className="text-sm text-gray-600">产品功能更新通知</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.systemUpdates}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        systemUpdates: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
                className="mt-4"
              >
                {isSavingNotifications ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存设置'
                )}
              </Button>
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
                <Badge variant="secondary" className="mb-2">
                  {user?.plan === 'free' ? '免费版' : 
                   user?.plan === 'professional' ? '专业版' :
                   user?.plan === 'institution' ? '机构版' :
                   user?.plan === 'ai_enhanced' ? 'AI增强版' : '免费版'}
                </Badge>
                <p className="text-sm text-gray-600">
                  当前使用{user?.plan === 'free' ? '免费' : 
                           user?.plan === 'professional' ? '专业' :
                           user?.plan === 'institution' ? '机构' :
                           user?.plan === 'ai_enhanced' ? 'AI增强' : '免费'}版本
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>题目数量</span>
                  <span className={currentUsage.questions >= usageLimits.questions ? 'text-red-600 font-medium' : ''}>
                    {currentUsage.questions}/{usageLimits.questions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>试卷数量</span>
                  <span className={currentUsage.papers >= usageLimits.papers ? 'text-red-600 font-medium' : ''}>
                    {currentUsage.papers}/{usageLimits.papers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>AI 出题</span>
                  <span>{usageLimits.aiEnabled ? '可用' : '不可用'}</span>
                </div>
              </div>
              {user?.plan === 'free' && (
                <Button className="w-full" variant="default">
                  升级到专业版
                </Button>
              )}
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
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleHelpClick('guide')}
              >
                使用指南
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleHelpClick('faq')}
              >
                常见问题
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleHelpClick('support')}
              >
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
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    删除中...
                  </>
                ) : (
                  '删除账户'
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                此操作不可撤销
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 删除账户确认对话框 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="删除账户"
        description="您确定要删除您的账户吗？此操作将永久删除您的所有数据，包括题目、试卷、答卷和报告。此操作不可撤销。"
        confirmText="确认删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}
