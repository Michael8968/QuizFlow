// Re-export types from shared package for backward compatibility
// This file can be removed once all imports are updated to use @quizflow/types directly
export type {
  Quiz,
  QuizQuestion,
  QuizQuestionWithAnswer,
  QuizAnswer,
  QuizState,
  QuestionType,
  DifficultyLevel,
  PaperSettings,
  SubmitAnswerDto,
  QuestionResponses,
} from '@quizflow/types'

// Re-export with aliases for backward compatibility
export type { QuizQuestion as Question } from '@quizflow/types'
export type { QuizAnswer as Answer } from '@quizflow/types'
