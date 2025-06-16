import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastInput {
  message: string;
  variant?: ToastVariant;
}

interface Toast extends ToastInput {
  id: string;
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (toast: ToastInput) => {
    const id = uuidv4();
    const newToast: Toast = { id, variant: toast.variant || 'info', message: toast.message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(id), 3000);
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow text-white text-sm ${
              t.variant === 'success'
                ? 'bg-green-600'
                : t.variant === 'error'
                ? 'bg-red-600'
                : 'bg-blue-600'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
