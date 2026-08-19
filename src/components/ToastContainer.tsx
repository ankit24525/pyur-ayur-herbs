"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    // Save reference to original window.alert
    const originalAlert = window.alert;

    // Override global window.alert with custom toast dispatcher
    window.alert = (message: string) => {
      let type: "success" | "error" | "info" = "info";
      const lower = message.toLowerCase();
      
      if (
        lower.includes("success") || 
        lower.includes("successfully") || 
        lower.includes("updated") || 
        lower.includes("added") || 
        lower.includes("sent") || 
        lower.includes("saved") ||
        lower.includes("timer adjusted")
      ) {
        type = "success";
      } else if (
        lower.includes("error") || 
        lower.includes("failed") || 
        lower.includes("wrong") || 
        lower.includes("invalid") || 
        lower.includes("check")
      ) {
        type = "error";
      }

      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
          role="alert"
        >
          {toast.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />}
          {toast.type === "info" && <Info className="size-5 shrink-0 text-amber-600 mt-0.5" />}
          
          <div className="flex-1 text-xs font-semibold leading-relaxed">
            {toast.message}
          </div>

          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-neutral-400 hover:text-neutral-600 transition"
          >
            <X className="size-4 shrink-0" />
          </button>
        </div>
      ))}
    </div>
  );
}
