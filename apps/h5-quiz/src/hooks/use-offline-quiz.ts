import { useCallback, useEffect, useRef } from 'react';
import { offlineStorage, AnswerProgress } from '../lib/offline-storage';
import { syncService } from '../lib/sync-service';
import type { Quiz, QuestionResponses } from '@quizflow/types';

interface UseOfflineQuizOptions {
  quiz: Quiz | null;
  quizCode: string;
  answers: QuestionResponses;
  currentQuestionIndex: number;
  timeRemaining: number;
  studentName?: string;
  studentEmail?: string;
  startedAt?: string;
  onProgressRestored?: (progress: AnswerProgress) => void;
}

interface UseOfflineQuizReturn {
  /** 保存当前进度到本地 */
  saveProgress: () => Promise<void>;
  /** 恢复之前保存的进度 */
  restoreProgress: () => Promise<AnswerProgress | undefined>;
  /** 清除保存的进度 */
  clearProgress: () => Promise<void>;
  /** 提交答卷（支持离线） */
  submitQuiz: (timeSpent: number) => Promise<{ success: boolean; offline?: boolean }>;
  /** 缓存试卷到本地 */
  cacheQuiz: (quiz: Quiz) => Promise<void>;
  /** 从本地获取缓存的试卷 */
  getCachedQuiz: (code: string) => Promise<Quiz | undefined>;
}

/**
 * 离线答题 Hook
 * 管理答题进度的本地存储和离线提交
 */
export function useOfflineQuiz(options: UseOfflineQuizOptions): UseOfflineQuizReturn {
  const {
    quiz,
    quizCode,
    answers,
    currentQuestionIndex,
    timeRemaining,
    onProgressRestored,
  } = options;

  // 使用 ref 存储最新的 options，避免频繁重新创建回调
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 自动保存进度的防抖定时器
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  /**
   * 保存答题进度
   */
  const saveProgress = useCallback(async () => {
    const currentOptions = optionsRef.current;
    if (!currentOptions.quiz) return;

    const progress: AnswerProgress = {
      quiz_id: currentOptions.quiz.id,
      quiz_code: currentOptions.quizCode,
      responses: currentOptions.answers,
      current_question_index: currentOptions.currentQuestionIndex,
      time_remaining: currentOptions.timeRemaining,
      student_name: currentOptions.studentName,
      student_email: currentOptions.studentEmail,
      started_at: currentOptions.startedAt || new Date().toISOString(),
      updated_at: Date.now(),
    };

    await offlineStorage.saveAnswerProgress(progress);
  }, []);

  /**
   * 恢复答题进度
   */
  const restoreProgress = useCallback(async (): Promise<AnswerProgress | undefined> => {
    const progress = await offlineStorage.getAnswerProgressByCode(quizCode);
    if (progress && onProgressRestored) {
      onProgressRestored(progress);
    }
    return progress;
  }, [quizCode, onProgressRestored]);

  /**
   * 清除答题进度
   */
  const clearProgress = useCallback(async () => {
    if (quiz) {
      await offlineStorage.deleteAnswerProgress(quiz.id);
    }
  }, [quiz]);

  /**
   * 提交答卷
   */
  const submitQuiz = useCallback(
    async (timeSpent: number) => {
      const currentOptions = optionsRef.current;

      const result = await syncService.submitAnswer({
        quiz_code: currentOptions.quizCode,
        student_name: currentOptions.studentName,
        student_email: currentOptions.studentEmail,
        responses: currentOptions.answers,
        time_spent: timeSpent,
        started_at: currentOptions.startedAt || new Date().toISOString(),
      });

      // 提交成功后清除本地进度
      if (result.success && currentOptions.quiz) {
        await offlineStorage.deleteAnswerProgress(currentOptions.quiz.id);
      }

      return result;
    },
    []
  );

  /**
   * 缓存试卷
   */
  const cacheQuiz = useCallback(async (quizToCache: Quiz) => {
    await offlineStorage.cacheQuiz(quizToCache);
  }, []);

  /**
   * 获取缓存的试卷
   */
  const getCachedQuiz = useCallback(async (code: string) => {
    return offlineStorage.getCachedQuizByCode(code);
  }, []);

  // 自动保存进度（每次答案变化时防抖保存）
  useEffect(() => {
    if (!quiz) return;

    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 延迟 500ms 保存，避免频繁写入
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [quiz, answers, currentQuestionIndex, timeRemaining, saveProgress]);

  // 页面卸载前保存进度
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 同步保存进度（注意：这里使用同步方式可能不可靠）
      saveProgress();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveProgress]);

  return {
    saveProgress,
    restoreProgress,
    clearProgress,
    submitQuiz,
    cacheQuiz,
    getCachedQuiz,
  };
}

export default useOfflineQuiz;
