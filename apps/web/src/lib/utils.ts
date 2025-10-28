import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatScore(score: number, total: number) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  return `${score}/${total} (${percentage}%)`
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'hard':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getQuestionTypeLabel(type: string) {
  switch (type) {
    case 'single':
      return '单选题'
    case 'multiple':
      return '多选题'
    case 'fill':
      return '填空题'
    case 'essay':
      return '问答题'
    default:
      return '未知类型'
  }
}

export function generateQuizCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
