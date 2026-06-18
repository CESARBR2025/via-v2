"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Info } from "lucide-react";

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
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <Bell size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[320px] rounded-xl bg-white border border-slate-200 shadow-modal overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-900">
              Notificaciones
            </h3>
          </div>

          <div className="p-2">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Bell
                  size={32}
                  strokeWidth={1.5}
                  className="text-slate-300 mb-2"
                />
                <p className="text-sm text-slate-600">
                  Sin notificaciones nuevas
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Info
                        size={15}
                        strokeWidth={1.5}
                        className="text-blue-700"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-slate-900 truncate">
                        {n.title}
                      </p>
                      <p className="text-[12px] text-slate-600 line-clamp-2 mt-0.5">
                        {n.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
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
