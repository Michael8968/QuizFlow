import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type { Quiz, QuestionResponses } from '@quizflow/types';

const DB_NAME = 'quizflow-offline';
const DB_VERSION = 1;

/**
 * 待提交的答卷
 */
export interface PendingSubmission {
  id: string;
  quiz_code: string;
  student_name?: string;
  student_email?: string;
  responses: QuestionResponses;
  time_spent: number;
  started_at: string;
  created_at: number;
}

/**
 * 答题进度
 */
export interface AnswerProgress {
  quiz_id: string;
  quiz_code: string;
  responses: QuestionResponses;
  current_question_index: number;
  time_remaining: number;
  student_name?: string;
  student_email?: string;
  started_at: string;
  updated_at: number;
}

/**
 * IndexedDB Schema 定义
 */
interface QuizFlowDBSchema extends DBSchema {
  quizzes: {
    key: string;
    value: Quiz & { cached_at: number };
  };
  answerProgress: {
    key: string;
    value: AnswerProgress;
    indexes: { 'by-quiz-code': string };
  };
  pendingSubmissions: {
    key: string;
    value: PendingSubmission;
    indexes: { 'by-created-at': number };
  };
}

/**
 * 离线存储管理类
 */
class OfflineStorage {
  private db: IDBPDatabase<QuizFlowDBSchema> | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    this.db = await openDB<QuizFlowDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 试卷缓存
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }

        // 答题进度
        if (!db.objectStoreNames.contains('answerProgress')) {
          const progressStore = db.createObjectStore('answerProgress', {
            keyPath: 'quiz_id',
          });
          progressStore.createIndex('by-quiz-code', 'quiz_code');
        }

        // 待提交的答卷
        if (!db.objectStoreNames.contains('pendingSubmissions')) {
          const submissionStore = db.createObjectStore('pendingSubmissions', {
            keyPath: 'id',
          });
          submissionStore.createIndex('by-created-at', 'created_at');
        }
      },
    });
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureDb(): Promise<IDBPDatabase<QuizFlowDBSchema>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================== 试卷缓存 ====================

  /**
   * 缓存试卷
   */
  async cacheQuiz(quiz: Quiz): Promise<void> {
    const db = await this.ensureDb();
    await db.put('quizzes', {
      ...quiz,
      cached_at: Date.now(),
    });
  }

  /**
   * 获取缓存的试卷
   */
  async getCachedQuiz(id: string): Promise<Quiz | undefined> {
    const db = await this.ensureDb();
    const cached = await db.get('quizzes', id);
    if (cached) {
      const { cached_at, ...quiz } = cached;
      return quiz as Quiz;
    }
    return undefined;
  }

  /**
   * 通过考试码获取缓存的试卷
   */
  async getCachedQuizByCode(code: string): Promise<Quiz | undefined> {
    const db = await this.ensureDb();
    const all = await db.getAll('quizzes');
    const cached = all.find((q) => q.quiz_code === code);
    if (cached) {
      const { cached_at, ...quiz } = cached;
      return quiz as Quiz;
    }
    return undefined;
  }

  /**
   * 删除过期的试卷缓存（默认7天）
   */
  async cleanExpiredQuizzes(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.ensureDb();
    const all = await db.getAll('quizzes');
    const now = Date.now();

    for (const quiz of all) {
      if (now - quiz.cached_at > maxAge) {
        await db.delete('quizzes', quiz.id);
      }
    }
  }

  // ==================== 答题进度 ====================

  /**
   * 保存答题进度
   */
  async saveAnswerProgress(progress: AnswerProgress): Promise<void> {
    const db = await this.ensureDb();
    await db.put('answerProgress', {
      ...progress,
      updated_at: Date.now(),
    });
  }

  /**
   * 获取答题进度
   */
  async getAnswerProgress(quizId: string): Promise<AnswerProgress | undefined> {
    const db = await this.ensureDb();
    return db.get('answerProgress', quizId);
  }

  /**
   * 通过考试码获取答题进度
   */
  async getAnswerProgressByCode(code: string): Promise<AnswerProgress | undefined> {
    const db = await this.ensureDb();
    const index = db.transaction('answerProgress').store.index('by-quiz-code');
    return index.get(code);
  }

  /**
   * 删除答题进度
   */
  async deleteAnswerProgress(quizId: string): Promise<void> {
    const db = await this.ensureDb();
    await db.delete('answerProgress', quizId);
  }

  /**
   * 清除所有答题进度
   */
  async clearAllProgress(): Promise<void> {
    const db = await this.ensureDb();
    await db.clear('answerProgress');
  }

  // ==================== 待提交答卷 ====================

  /**
   * 添加待提交的答卷
   */
  async addPendingSubmission(
    submission: Omit<PendingSubmission, 'id' | 'created_at'>
  ): Promise<string> {
    const db = await this.ensureDb();
    const id = crypto.randomUUID();
    await db.add('pendingSubmissions', {
      ...submission,
      id,
      created_at: Date.now(),
    });
    return id;
  }

  /**
   * 获取所有待提交的答卷
   */
  async getPendingSubmissions(): Promise<PendingSubmission[]> {
    const db = await this.ensureDb();
    const index = db.transaction('pendingSubmissions').store.index('by-created-at');
    return index.getAll();
  }

  /**
   * 获取待提交答卷数量
   */
  async getPendingSubmissionCount(): Promise<number> {
    const db = await this.ensureDb();
    return db.count('pendingSubmissions');
  }

  /**
   * 删除已提交的答卷
   */
  async removePendingSubmission(id: string): Promise<void> {
    const db = await this.ensureDb();
    await db.delete('pendingSubmissions', id);
  }

  /**
   * 清除所有待提交答卷
   */
  async clearAllPendingSubmissions(): Promise<void> {
    const db = await this.ensureDb();
    await db.clear('pendingSubmissions');
  }

  // ==================== 工具方法 ====================

  /**
   * 清除所有离线数据
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDb();
    await Promise.all([
      db.clear('quizzes'),
      db.clear('answerProgress'),
      db.clear('pendingSubmissions'),
    ]);
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    quizCount: number;
    progressCount: number;
    pendingCount: number;
  }> {
    const db = await this.ensureDb();
    const [quizCount, progressCount, pendingCount] = await Promise.all([
      db.count('quizzes'),
      db.count('answerProgress'),
      db.count('pendingSubmissions'),
    ]);
    return { quizCount, progressCount, pendingCount };
  }
}

export const offlineStorage = new OfflineStorage();
