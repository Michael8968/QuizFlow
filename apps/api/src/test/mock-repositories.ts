/**
 * Repository Mock 工厂
 * 用于创建各种 Repository 的模拟实现
 */

/**
 * 创建 QuestionRepository 模拟
 */
export function createMockQuestionRepository() {
  return {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByIds: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    belongsToUser: jest.fn(),
    countByUserId: jest.fn(),
    getTagsByUserId: jest.fn(),
  };
}

/**
 * 创建 PaperRepository 模拟
 */
export function createMockPaperRepository() {
  return {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByIds: jest.fn(),
    findByQuizCode: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    belongsToUser: jest.fn(),
    countByUserId: jest.fn(),
    generateUniqueQuizCode: jest.fn(),
    updateStatus: jest.fn(),
  };
}

/**
 * 创建 AnswerRepository 模拟
 */
export function createMockAnswerRepository() {
  return {
    findById: jest.fn(),
    findByPaperId: jest.fn(),
    findAllByPaperId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    hasSubmitted: jest.fn(),
    getStatsByPaperId: jest.fn(),
    updateScore: jest.fn(),
  };
}

/**
 * 创建 ReportRepository 模拟
 */
export function createMockReportRepository() {
  return {
    findById: jest.fn(),
    findByPaperId: jest.fn(),
    findByUserIdWithPaper: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  };
}

/**
 * 创建 UserRepository 模拟
 */
export function createMockUserRepository() {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    emailExists: jest.fn(),
    createUser: jest.fn(),
  };
}

/**
 * 创建 SupabaseService 模拟
 */
export function createMockSupabaseService() {
  return {
    getClient: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        refreshSession: jest.fn(),
      },
    }),
  };
}

export type MockQuestionRepository = ReturnType<typeof createMockQuestionRepository>;
export type MockPaperRepository = ReturnType<typeof createMockPaperRepository>;
export type MockAnswerRepository = ReturnType<typeof createMockAnswerRepository>;
export type MockReportRepository = ReturnType<typeof createMockReportRepository>;
export type MockUserRepository = ReturnType<typeof createMockUserRepository>;
export type MockSupabaseService = ReturnType<typeof createMockSupabaseService>;
