/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 2800);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex items-center gap-3 rounded-md bg-neutral-950 px-4 py-3 text-sm text-white shadow-soft dark:bg-white dark:text-neutral-950">
            <FiCheckCircle className="shrink-0 text-accent" />
            <span className="flex-1">{toast.message}</span>
            <button type="button" aria-label="Закрыть" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}>
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
