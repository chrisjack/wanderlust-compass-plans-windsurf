import { useEffect, useState } from 'react';
import { syncService, SyncStatus } from '@/lib/syncService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function OfflineStatusIndicator() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingOperations: 0,
    lastSyncTime: 0,
  });

  useEffect(() => {
    const unsubscribe = syncService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const handleManualSync = () => {
    syncService.syncPendingOperations();
  };

  const formatLastSync = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }
    
    if (!status.isOnline) {
      return <WifiOff className="h-3 w-3" />;
    }
    
    if (status.pendingOperations > 0) {
      return <AlertCircle className="h-3 w-3" />;
    }
    
    return <Wifi className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (status.isSyncing) {
      return 'Syncing...';
    }
    
    if (!status.isOnline) {
      return 'Offline';
    }
    
    if (status.pendingOperations > 0) {
      return `${status.pendingOperations} pending`;
    }
    
    return 'Online';
  };

  const getStatusVariant = () => {
    if (status.isSyncing) return 'secondary';
    if (!status.isOnline) return 'destructive';
    if (status.pendingOperations > 0) return 'default';
    return 'secondary';
  };

  const getTooltipContent = () => {
    if (status.isSyncing) {
      return 'Synchronizing with server...';
    }
    
    if (!status.isOnline) {
      return 'You are offline. Changes will be saved locally and synced when connection is restored.';
    }
    
    if (status.pendingOperations > 0) {
      return `${status.pendingOperations} changes waiting to sync. Last sync: ${formatLastSync(status.lastSyncTime)}`;
    }
    
    return `All changes synced. Last sync: ${formatLastSync(status.lastSyncTime)}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant()} className="text-xs">
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
            
            {status.pendingOperations > 0 && status.isOnline && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleManualSync}
                disabled={status.isSyncing}
                className="h-6 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${status.isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 