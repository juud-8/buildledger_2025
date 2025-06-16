import { useState, useEffect } from 'react';

interface OfflineData<T = unknown> {
  id: string;
  type: 'invoice' | 'client' | 'update';
  data: T;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<OfflineData[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending data on mount
    loadPendingData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingData = () => {
    try {
      const stored = localStorage.getItem('buildledger_pending_sync');
      if (stored) {
        setPendingSync(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending sync data:', error);
    }
  };

  const savePendingData = (data: OfflineData[]) => {
    try {
      localStorage.setItem('buildledger_pending_sync', JSON.stringify(data));
      setPendingSync(data);
    } catch (error) {
      console.error('Error saving pending sync data:', error);
    }
  };

  const addToPendingSync = <T,>(type: OfflineData['type'], data: T) => {
    const newItem: OfflineData<T> = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: Date.now()
    };

    const updated = [...pendingSync, newItem];
    savePendingData(updated);
  };

  const syncPendingData = async () => {
    if (pendingSync.length === 0) return;

    try {
      // Process each pending item
      for (const item of pendingSync) {
        // In a real app, you would sync with your backend here
        console.log('Syncing item:', item);
      }

      // Clear pending data after successful sync
      savePendingData([]);
    } catch (error) {
      console.error('Error syncing pending data:', error);
    }
  };

  const saveOfflineData = <T,>(type: OfflineData['type'], data: T) => {
    if (!isOnline) {
      addToPendingSync(type, data);
      return false; // Indicate offline save
    }
    return true; // Indicate online save
  };

  return {
    isOnline,
    pendingSync: pendingSync.length,
    saveOfflineData,
    syncPendingData
  };
};