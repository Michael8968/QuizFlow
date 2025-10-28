import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QuizState, Quiz, Answer } from '@/types'

interface QuizStore extends QuizState {
  setQuiz: (quiz: Quiz) => void
  setCurrentQuestionIndex: (index: number) => void
  setAnswer: (questionId: string, answer: string | string[]) => void
  setTimeRemaining: (time: number) => void
  setSubmitted: (submitted: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: QuizState = {
  quiz: null,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  isSubmitted: false,
  isLoading: false,
  error: null,
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setQuiz: (quiz) => set({ 
        quiz, 
        timeRemaining: quiz.settings.time_limit ? quiz.settings.time_limit * 60 : 0,
        currentQuestionIndex: 0,
        answers: {},
        isSubmitted: false,
        error: null
      }),
      
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      
      setAnswer: (questionId, answer) => set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: answer
        }
      })),
      
      setTimeRemaining: (time) => set({ timeRemaining: time }),
      
      setSubmitted: (submitted) => set({ isSubmitted: submitted }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        quiz: state.quiz,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        timeRemaining: state.timeRemaining,
        isSubmitted: state.isSubmitted,
      }),
    }
  )
)
