import { createContext, useContext, ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth'

interface AuthContextType {
  user: ReturnType<typeof useAuthStore>['user']
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading } = useAuthStore()

  const value = {
    user,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
