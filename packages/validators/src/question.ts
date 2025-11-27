import { z } from 'zod';

/**
 * 题目类型枚举
 */
export const questionTypeSchema = z.enum(['single', 'multiple', 'fill', 'essay']);

/**
 * 难度等级枚举
 */
export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

/**
 * 题目基础 schema（不含 refine 验证）
 */
const questionBaseSchema = z.object({
  type: questionTypeSchema,
  content: z.string().min(1, '题目内容不能为空').max(5000, '题目内容最多 5000 个字符'),
  options: z.array(z.string().min(1, '选项不能为空')).optional(),
  answer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().max(2000, '解析最多 2000 个字符').optional(),
  tags: z.array(z.string()).default([]),
  difficulty: difficultySchema.default('medium'),
  points: z.number().min(1, '分值至少为 1').max(100, '分值最多为 100').default(1),
});

/**
 * 题目交叉验证规则
 */
const questionRefinements = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data: z.infer<typeof questionBaseSchema>) => {
        // 单选题和多选题必须有选项
        if (['single', 'multiple'].includes(data.type)) {
          return data.options && data.options.length >= 2;
        }
        return true;
      },
      { message: '选择题至少需要 2 个选项', path: ['options'] }
    )
    .refine(
      (data: z.infer<typeof questionBaseSchema>) => {
        // 多选题答案必须是数组
        if (data.type === 'multiple') {
          return Array.isArray(data.answer);
        }
        return true;
      },
      { message: '多选题答案必须是数组', path: ['answer'] }
    )
    .refine(
      (data: z.infer<typeof questionBaseSchema>) => {
        // 单选题答案必须是字符串
        if (data.type === 'single') {
          return typeof data.answer === 'string';
        }
        return true;
      },
      { message: '单选题答案必须是字符串', path: ['answer'] }
    );

/**
 * 创建题目验证
 */
export const createQuestionSchema = questionRefinements(questionBaseSchema);

/**
 * 更新题目验证（所有字段可选）
 */
export const updateQuestionSchema = questionBaseSchema.partial();

// 导出推断类型
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
