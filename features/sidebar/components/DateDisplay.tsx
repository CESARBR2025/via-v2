"use client";

import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";

export default function DateDisplay() {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    );
  }, []);

  if (!dateStr) return null;

  return (
    <div className="hidden lg:flex items-center gap-1.5 text-[13px] text-[#64748B] whitespace-nowrap">
      <CalendarDays size={14} strokeWidth={1.5} className="text-[#94A3B8]" />
      <span className="capitalize">{dateStr}</span>
    </div>
  );
}
