import { useState, useEffect, useCallback } from 'react';
import { syncService, SyncStatus } from '../lib/sync-service';

/**
 * 网络状态 Hook
 * 监听网络连接状态变化
 */
export function useNetworkStatus(): {
  isOnline: boolean;
} {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

/**
 * 同步状态 Hook
 * 监听离线同步服务的状态变化
 */
export function useSyncStatus(): SyncStatus & {
  manualSync: () => Promise<void>;
} {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
  });

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const manualSync = useCallback(async () => {
    try {
      await syncService.manualSync();
    } catch (error) {
      console.error('手动同步失败:', error);
      throw error;
    }
  }, []);

  return {
    ...status,
    manualSync,
  };
}

export default useNetworkStatus;
