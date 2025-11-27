import type { Question, Paper, User, Answer } from '@quizflow/types';

/**
 * 生成模拟用户
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'teacher',
    plan: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 生成模拟题目
 */
export function createMockQuestion(overrides?: Partial<Question>): Question {
  return {
    id: 'question-123',
    user_id: 'user-123',
    type: 'single',
    content: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    answer: '2',
    explanation: '基础数学运算',
    tags: ['math', 'basic'],
    difficulty: 'easy',
    points: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 生成模拟试卷
 */
export function createMockPaper(overrides?: Partial<Paper>): Paper {
  return {
    id: 'paper-123',
    user_id: 'user-123',
    title: '测试试卷',
    description: '这是一份测试试卷',
    status: 'draft',
    quiz_code: undefined,
    questions: [],
    settings: {
      time_limit: 60,
      shuffle_questions: false,
      shuffle_options: false,
      show_correct_answer: true,
      allow_review: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 生成模拟答卷
 */
export function createMockAnswer(overrides?: Partial<Answer>): Answer {
  return {
    id: 'answer-123',
    paper_id: 'paper-123',
    student_name: '学生A',
    student_email: 'student@example.com',
    responses: {
      'question-123': '2',
    },
    score: 80,
    total_score: 100,
    status: 'completed',
    started_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 生成多个模拟题目
 */
export function createMockQuestions(count: number, overrides?: Partial<Question>): Question[] {
  return Array.from({ length: count }, (_, i) =>
    createMockQuestion({
      id: `question-${i + 1}`,
      content: `测试题目 ${i + 1}`,
      ...overrides,
    }),
  );
}

/**
 * 生成多个模拟试卷
 */
export function createMockPapers(count: number, overrides?: Partial<Paper>): Paper[] {
  return Array.from({ length: count }, (_, i) =>
    createMockPaper({
      id: `paper-${i + 1}`,
      title: `测试试卷 ${i + 1}`,
      ...overrides,
    }),
  );
}
