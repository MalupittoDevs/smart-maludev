import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; type: "success" | "error" | "info"; msg: string };
type ToastInput = Omit<Toast, "id">;
type ToastContextType = {
  push: (_toastInput: ToastInput) => void;
};



const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    // autodescartar después de 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "grid",
          gap: 8,
          zIndex: 50,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              minWidth: 220,
              border: "1px solid #1f2a37",
              background:
                toast.type === "success"
                  ? "#0f2d1d"
                  : toast.type === "error"
                  ? "#351517"
                  : "#0f141b",
              color:
                toast.type === "success"
                  ? "#86efac"
                  : toast.type === "error"
                  ? "#fca5a5"
                  : "#e6edf3",
            }}
          >
            {toast.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
