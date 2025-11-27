import type { DifficultyLevel, QuestionType } from '@quizflow/types';

/**
 * 获取难度对应的颜色类名
 */
export function getDifficultyColor(difficulty: DifficultyLevel | string): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * 获取难度标签
 */
export function getDifficultyLabel(difficulty: DifficultyLevel | string): string {
  switch (difficulty) {
    case 'easy':
      return '简单';
    case 'medium':
      return '中等';
    case 'hard':
      return '困难';
    default:
      return '未知';
  }
}

/**
 * 获取题目类型标签
 */
export function getQuestionTypeLabel(type: QuestionType | string): string {
  switch (type) {
    case 'single':
      return '单选题';
    case 'multiple':
      return '多选题';
    case 'fill':
      return '填空题';
    case 'essay':
      return '问答题';
    default:
      return '未知类型';
  }
}

/**
 * 获取状态对应的颜色类名
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    case 'published':
      return 'text-green-600 bg-green-100';
    case 'archived':
      return 'text-yellow-600 bg-yellow-100';
    case 'completed':
      return 'text-blue-600 bg-blue-100';
    case 'in_progress':
      return 'text-orange-600 bg-orange-100';
    case 'graded':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * 获取状态标签
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return '草稿';
    case 'published':
      return '已发布';
    case 'archived':
      return '已归档';
    case 'completed':
      return '已完成';
    case 'in_progress':
      return '进行中';
    case 'graded':
      return '已评分';
    default:
      return status;
  }
}

/**
 * 生成随机考试码
 */
export function generateQuizCode(): string {
  // 使用大写字母和数字，排除容易混淆的字符（0, O, I, L, 1）
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 计算答卷得分
 */
export function calculateScore(
  responses: Record<string, string | string[]>,
  questions: Array<{
    id: string;
    answer: string | string[];
    points: number;
  }>
): { score: number; totalScore: number } {
  let score = 0;
  let totalScore = 0;

  for (const question of questions) {
    totalScore += question.points;
    const userAnswer = responses[question.id];
    const correctAnswer = question.answer;

    if (!userAnswer) continue;

    // 比较答案
    if (Array.isArray(correctAnswer)) {
      // 多选题
      if (Array.isArray(userAnswer)) {
        const sortedUser = [...userAnswer].sort();
        const sortedCorrect = [...correctAnswer].sort();
        if (
          sortedUser.length === sortedCorrect.length &&
          sortedUser.every((v, i) => v === sortedCorrect[i])
        ) {
          score += question.points;
        }
      }
    } else {
      // 单选题/填空题
      if (userAnswer === correctAnswer) {
        score += question.points;
      }
    }
  }

  return { score, totalScore };
}
