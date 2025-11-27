import { z } from 'zod';

/**
 * 试卷状态枚举
 */
export const paperStatusSchema = z.enum(['draft', 'published', 'archived']);

/**
 * 试卷设置验证
 */
export const paperSettingsSchema = z.object({
  time_limit: z.number().min(1).max(480).optional(), // 最长 8 小时
  shuffle_questions: z.boolean().default(false),
  shuffle_options: z.boolean().default(false),
  show_correct_answer: z.boolean().default(true),
  allow_review: z.boolean().default(true),
});

/**
 * 创建试卷验证
 */
export const createPaperSchema = z.object({
  title: z.string().min(1, '试卷标题不能为空').max(200, '试卷标题最多 200 个字符'),
  description: z.string().max(2000, '试卷描述最多 2000 个字符').optional(),
  question_ids: z.array(z.string().uuid('无效的题目 ID')).min(1, '至少选择一道题目'),
  settings: paperSettingsSchema,
  status: paperStatusSchema.default('draft'),
});

/**
 * 更新试卷验证
 */
export const updatePaperSchema = createPaperSchema.partial();

// 导出推断类型
export type PaperSettings = z.infer<typeof paperSettingsSchema>;
export type CreatePaperInput = z.infer<typeof createPaperSchema>;
export type UpdatePaperInput = z.infer<typeof updatePaperSchema>;
