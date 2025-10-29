import { createContext, useContext, ReactNode } from 'react'

interface QuizContextType {
  // 这里可以添加其他需要共享的方法
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}

interface QuizProviderProps {
  children: ReactNode
}

export function QuizProvider({ children }: QuizProviderProps) {
  // 这里可以添加全局的 quiz 相关逻辑
  
  return (
    <QuizContext.Provider value={{}}>
      {children}
    </QuizContext.Provider>
  )
}
