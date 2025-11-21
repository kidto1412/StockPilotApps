// providers/ToastProvider.tsx
import { Toast } from '@/components/Toast';
import React, { createContext, useContext, useState } from 'react';

interface ToastMessageContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastMessageContext = createContext<ToastMessageContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return (
    <ToastMessageContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast message={toast.message} type={toast.type} onHide={hideToast} />
      )}
    </ToastMessageContext.Provider>
  );
}

export function useToastMessage() {
  return useContext(ToastMessageContext);
}
