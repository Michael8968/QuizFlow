import { z } from 'zod';

/**
 * 答卷状态枚举
 */
export const answerStatusSchema = z.enum(['in_progress', 'completed', 'graded']);

/**
 * 提交答卷验证
 */
export const submitAnswerSchema = z.object({
  quiz_code: z
    .string()
    .min(1, '考试码不能为空')
    .max(10, '考试码格式错误')
    .regex(/^[A-Z0-9]+$/, '考试码只能包含大写字母和数字'),
  student_name: z.string().max(50, '姓名最多 50 个字符').optional(),
  student_email: z.string().email('请输入有效的邮箱地址').optional(),
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  time_spent: z.number().min(0, '答题时间不能为负数'),
});

// 导出推断类型
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
