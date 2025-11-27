// Auth validators
export {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from './auth';

// Question validators
export {
  questionTypeSchema,
  difficultySchema,
  createQuestionSchema,
  updateQuestionSchema,
  type CreateQuestionInput,
  type UpdateQuestionInput,
} from './question';

// Paper validators
export {
  paperStatusSchema,
  paperSettingsSchema,
  createPaperSchema,
  updatePaperSchema,
  type PaperSettings,
  type CreatePaperInput,
  type UpdatePaperInput,
} from './paper';

// Answer validators
export {
  answerStatusSchema,
  submitAnswerSchema,
  type SubmitAnswerInput,
} from './answer';

// AI validators
export {
  generateQuestionsSchema,
  type GenerateQuestionsInput,
} from './ai';
