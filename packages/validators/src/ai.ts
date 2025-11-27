import { z } from 'zod';
import { questionTypeSchema, difficultySchema } from './question';

/**
 * AI 生成题目请求验证
 */
export const generateQuestionsSchema = z.object({
  prompt: z
    .string()
    .min(1, '请输入题目主题')
    .max(1000, '题目主题最多 1000 个字符'),
  count: z
    .number()
    .min(1, '至少生成 1 道题目')
    .max(20, '最多生成 20 道题目')
    .default(5),
  type: questionTypeSchema,
  difficulty: difficultySchema.optional(),
});

// 导出推断类型
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
