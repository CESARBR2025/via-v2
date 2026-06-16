"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useToastStore, type ToastType } from "@/stores/useToastStore";

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const STYLES: Record<ToastType, string> = {
  success: "bg-[#22C55E] text-white",
  error: "bg-[#EF4444] text-white",
  warning: "bg-[#F59E0B] text-white",
  info: "bg-[#2563EB] text-white",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm"
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

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        text-sm font-medium
        transition-all duration-300 ease-out
        ${STYLES[type]}
        ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
      `}
      role="alert"
    >
      <span className="text-base leading-none">{ICONS[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-0.5 rounded hover:opacity-80 transition-opacity shrink-0"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
