import * as React from 'react'
import { useToast } from '@/hooks/use-toast'

const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    variant?: 'default' | 'destructive'
  }>>([])

  const toast = React.useCallback(
    ({ title, description, action, variant = 'default' }: {
      title?: React.ReactNode
      description?: React.ReactNode
      action?: React.ReactNode
      variant?: 'default' | 'destructive'
    }) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, action, variant }])
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  return { toast, toasts }
}

export { useToast }
