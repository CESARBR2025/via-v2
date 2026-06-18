"use client";

import { useOnlineStatus } from "@/lib/online";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center gap-2.5 px-4 py-2 bg-[#DC2626] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(220,38,38,0.3)]">
      <WifiOff size={14} strokeWidth={2.5} />
      <span>Dispositivo sin conexión</span>
      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
    </div>
  );
}
