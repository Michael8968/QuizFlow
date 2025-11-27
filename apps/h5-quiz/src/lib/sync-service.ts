import { offlineStorage, PendingSubmission } from './offline-storage';
import { api } from './api';

export interface SyncResult {
  success: boolean;
  offline?: boolean;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncAt?: number;
  isSyncing: boolean;
}

type SyncStatusListener = (status: SyncStatus) => void;

/**
 * 离线同步服务
 * 负责管理网络状态、答卷提交和离线数据同步
 */
class SyncService {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInProgress = false;
  private lastSyncAt?: number;
  private listeners: Set<SyncStatusListener> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 监听网络状态变化
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // 页面可见时尝试同步
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      // 初始化时如果在线，启动同步
      if (this.isOnline) {
        this.startAutoSync();
      }
    }
  }

  /**
   * 处理网络恢复
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners();
    this.syncPendingSubmissions();
    this.startAutoSync();
  };

  /**
   * 处理网络断开
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners();
    this.stopAutoSync();
  };

  /**
   * 处理页面可见性变化
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.isOnline) {
      this.syncPendingSubmissions();
    }
  };

  /**
   * 启动自动同步（每 30 秒检查一次）
   */
  private startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingSubmissions();
      }
    }, 30000);
  }

  /**
   * 停止自动同步
   */
  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 通知所有监听器状态变化
   */
  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * 订阅同步状态变化
   */
  subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    // 立即通知当前状态
    this.getStatus().then(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 获取当前同步状态
   */
  async getStatus(): Promise<SyncStatus> {
    const pendingCount = await offlineStorage.getPendingSubmissionCount();
    return {
      isOnline: this.isOnline,
      pendingCount,
      lastSyncAt: this.lastSyncAt,
      isSyncing: this.syncInProgress,
    };
  }

  /**
   * 检查网络状态
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * 提交答卷（支持离线）
   */
  async submitAnswer(data: {
    quiz_code: string;
    student_name?: string;
    student_email?: string;
    responses: Record<string, string | string[]>;
    time_spent: number;
    started_at: string;
  }): Promise<SyncResult> {
    if (this.isOnline) {
      try {
        await api.submitAnswer(data);
        return { success: true };
      } catch (error) {
        // 网络请求失败，保存到本地
        console.warn('在线提交失败，保存到离线队列:', error);
        await offlineStorage.addPendingSubmission(data);
        await this.notifyListeners();
        return { success: true, offline: true };
      }
    } else {
      // 离线状态，保存到本地
      await offlineStorage.addPendingSubmission(data);
      await this.notifyListeners();
      return { success: true, offline: true };
    }
  }

  /**
   * 同步所有待提交的答卷
   */
  async syncPendingSubmissions(): Promise<{
    synced: number;
    failed: number;
    remaining: number;
  }> {
    if (this.syncInProgress || !this.isOnline) {
      const remaining = await offlineStorage.getPendingSubmissionCount();
      return { synced: 0, failed: 0, remaining };
    }

    this.syncInProgress = true;
    await this.notifyListeners();

    let synced = 0;
    let failed = 0;

    try {
      const pending = await offlineStorage.getPendingSubmissions();

      for (const item of pending) {
        try {
          await this.syncSingleSubmission(item);
          await offlineStorage.removePendingSubmission(item.id);
          synced++;
        } catch (error) {
          console.error('同步答卷失败:', item.id, error);
          failed++;
          // 继续处理下一个
        }
      }

      this.lastSyncAt = Date.now();
    } finally {
      this.syncInProgress = false;
      await this.notifyListeners();
    }

    const remaining = await offlineStorage.getPendingSubmissionCount();
    return { synced, failed, remaining };
  }

  /**
   * 同步单个答卷
   */
  private async syncSingleSubmission(submission: PendingSubmission): Promise<void> {
    const data = {
      quiz_code: submission.quiz_code,
      student_name: submission.student_name,
      student_email: submission.student_email,
      responses: submission.responses,
      time_spent: submission.time_spent,
    };

    await api.submitAnswer(data);
  }

  /**
   * 手动触发同步
   */
  async manualSync(): Promise<{
    synced: number;
    failed: number;
    remaining: number;
  }> {
    if (!this.isOnline) {
      throw new Error('当前处于离线状态，无法同步');
    }
    return this.syncPendingSubmissions();
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.stopAutoSync();
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
