import { z } from 'zod';

/**
 * 邮箱验证
 */
export const emailSchema = z.string().email('请输入有效的邮箱地址');

/**
 * 密码验证（至少 6 位）
 */
export const passwordSchema = z
  .string()
  .min(6, '密码至少 6 个字符')
  .max(100, '密码最多 100 个字符');

/**
 * 登录表单验证
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * 注册表单验证
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, '请输入姓名').max(50, '姓名最多 50 个字符'),
});

// 导出推断类型
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
