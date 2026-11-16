import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const ToastContext = createContext(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // show("Removed Oats", { label: "Undo", onClick })
  const show = useCallback((message, action) => {
    setToast({ id: Date.now(), message, action });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.action ? 5000 : 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" aria-live="polite">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            >
              <span>{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  className="toast-action"
                  onClick={() => {
                    toast.action.onClick();
                    setToast(null);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
