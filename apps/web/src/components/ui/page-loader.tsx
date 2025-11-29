import { Loader2 } from 'lucide-react'

/**
 * 页面加载组件 - 用于路由懒加载时的加载状态
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}
