/**
 * 反馈类型
 */
export type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

/**
 * 反馈状态
 */
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

/**
 * 反馈基础信息
 */
export interface FeedbackBase {
  type: FeedbackType;
  title: string;
  content: string;
  rating?: number;
  user_email?: string;
  user_name?: string;
}

/**
 * 完整反馈信息
 */
export interface Feedback extends FeedbackBase {
  id: string;
  user_id?: string;
  status: FeedbackStatus;
  admin_response?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * 创建反馈 DTO
 */
export interface CreateFeedbackDto {
  type: FeedbackType;
  title: string;
  content: string;
  rating?: number;
  user_email?: string;
  user_name?: string;
}

/**
 * 更新反馈 DTO（管理员用）
 */
export interface UpdateFeedbackDto {
  status?: FeedbackStatus;
  admin_response?: string;
}
