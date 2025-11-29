import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from '@quizflow/i18n';
import { useSyncStatus } from '../hooks/use-network-status';
import { cn } from '../lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showPendingCount?: boolean;
}

/**
 * 离线状态指示器
 * 显示网络状态和待同步数量
 */
export function OfflineIndicator({
  className,
  showPendingCount = true,
}: OfflineIndicatorProps) {
  const { t } = useTranslation(['common']);
  const { isOnline, pendingCount, isSyncing, manualSync } = useSyncStatus();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Show notification when network status changes
  useEffect(() => {
    if (!isOnline) {
      setToastMessage(t('common:status.info'));
      setToastType('info');
      setShowToast(true);
    } else if (pendingCount > 0) {
      setToastMessage(t('common:status.processing'));
      setToastType('info');
      setShowToast(true);
    }
  }, [isOnline, pendingCount, t]);

  // 自动隐藏提示
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;

    try {
      await manualSync();
      setToastMessage(t('common:message.operationSuccess'));
      setToastType('success');
      setShowToast(true);
    } catch {
      setToastMessage(t('common:message.operationFailed'));
      setToastType('error');
      setShowToast(true);
    }
  };

  // 如果在线且没有待同步内容，不显示指示器
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* 状态指示器 */}
      <div
        className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg transition-all',
          isOnline
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800',
          className
        )}
      >
        {isOnline ? (
          <>
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
            {showPendingCount && pendingCount > 0 && (
              <span>{pendingCount} {t('common:status.pending')}</span>
            )}
            {!isSyncing && pendingCount > 0 && (
              <button
                onClick={handleManualSync}
                className="ml-1 rounded-full p-1 hover:bg-yellow-200 transition-colors"
                title={t('common:action.refresh')}
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>{t('common:status.info')}</span>
          </>
        )}
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div
          className={cn(
            'fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-top',
            toastType === 'success' && 'bg-green-100 text-green-800',
            toastType === 'error' && 'bg-red-100 text-red-800',
            toastType === 'info' && 'bg-blue-100 text-blue-800'
          )}
        >
          {toastType === 'success' && <Check className="h-4 w-4" />}
          {toastType === 'error' && <AlertCircle className="h-4 w-4" />}
          {toastType === 'info' && (
            isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

/**
 * Network status badge
 * Simple icon display
 */
export function NetworkBadge({ className }: { className?: string }) {
  const { t } = useTranslation(['common']);
  const { isOnline, pendingCount } = useSyncStatus();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
        isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
        className
      )}
    >
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {!isOnline && <span>{t('common:status.info')}</span>}
      {isOnline && pendingCount > 0 && (
        <span className="ml-1 rounded-full bg-yellow-500 px-1.5 text-white">
          {pendingCount}
        </span>
      )}
    </div>
  );
}

export default OfflineIndicator;
