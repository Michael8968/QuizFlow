import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { useToast } from '@/hooks/use-toast'

const Toaster = () => {
  const { toasts } = useToast()

  return (
    <ToastPrimitives.Provider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastPrimitives.Root key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastPrimitives.Title>{title}</ToastPrimitives.Title>}
              {description && (
                <ToastPrimitives.Description>
                  {description}
                </ToastPrimitives.Description>
              )}
            </div>
            {action}
            <ToastPrimitives.Close />
          </ToastPrimitives.Root>
        )
      })}
      <ToastPrimitives.Viewport />
    </ToastPrimitives.Provider>
  )
}

export { Toaster }
