"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Info, X } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Novedades del sistema",
    description: "Ya puedes consultar infracciones desde el dashboard.",
    time: "hace 2 días",
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          w-9 h-9 rounded-lg flex items-center justify-center
          transition-colors duration-150
          ${
            open
              ? "bg-[#EFF6FF] text-[#2563EB]"
              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          }
        `}
      >
        <Bell size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[320px] rounded-xl bg-white border border-[#E2E8F0] shadow-[0_20px_60px_rgba(0,0,0,0.12),0_8px_20px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Notificaciones
            </h3>
          </div>

          <div className="p-2">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Bell
                  size={32}
                  strokeWidth={1.5}
                  className="text-[#CBD5E1] mb-2"
                />
                <p className="text-sm text-[#64748B]">
                  Sin notificaciones nuevas
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                      <Info
                        size={15}
                        strokeWidth={1.5}
                        className="text-[#2563EB]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#0F172A] truncate">
                        {n.title}
                      </p>
                      <p className="text-[12px] text-[#64748B] line-clamp-2 mt-0.5">
                        {n.description}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] mt-1">
                        {n.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
