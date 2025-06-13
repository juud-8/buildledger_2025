import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, FolderSync as Sync } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingSync, syncPendingData } = useOfflineSync();

  if (isOnline && pendingSync === 0) {
    return null; // Don't show anything when online and no pending sync
  }

  return (
    <div className={`fixed top-16 md:top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
      isOnline 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
          {pendingSync > 0 && (
            <>
              <span>•</span>
              <button
                onClick={syncPendingData}
                className="flex items-center gap-1 text-green-700 hover:text-green-900 transition-colors"
              >
                <Sync className="h-3 w-3" />
                <span>Sync {pendingSync}</span>
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
          {pendingSync > 0 && (
            <>
              <span>•</span>
              <CloudOff className="h-3 w-3" />
              <span>{pendingSync} pending</span>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;