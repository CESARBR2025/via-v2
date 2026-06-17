"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore, type ToastType } from "@/stores/useToastStore";

const ICON_MAP: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, { bar: string; icon: string; text: string }> = {
  success: { bar: "#22C55E", icon: "#22C55E", text: "#166534" },
  error: { bar: "#EF4444", icon: "#EF4444", text: "#991B1B" },
  warning: { bar: "#F59E0B", icon: "#F59E0B", text: "#92400E" },
  info: { bar: "#2563EB", icon: "#2563EB", text: "#1E40AF" },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const Icon = ICON_MAP[type];
  const styles = STYLES[type];

  return (
    <div
      className={`
        flex items-start gap-3 rounded-xl shadow-lg
        text-sm font-medium
        transition-all duration-300 ease-out
        bg-white border
        ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
      `}
      style={{ borderColor: "#E2E8F0", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
      role="alert"
    >
      <div className="w-1 self-stretch shrink-0 rounded-l-xl" style={{ background: styles.bar }} />

      <div className="flex items-start gap-3 py-3.5 pr-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${styles.icon}14` }}
        >
          <Icon size={16} strokeWidth={2} style={{ color: styles.icon }} />
        </div>

        <p className="flex-1 pt-0.5 leading-snug" style={{ color: styles.text }}>
          {message}
        </p>

        <button
          onClick={onClose}
          className="p-0.5 rounded hover:opacity-80 transition-opacity shrink-0 mt-0.5"
          style={{ color: "#94A3B8" }}
          aria-label="Cerrar"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
