import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, ArrowLeft } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <main className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <Image
        src="/roles/via-wallpaper.png"
        alt=""
        fill
        className="object-cover blur-[3px]"
        priority
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/50 to-slate-700/10" />

      {/* Decorative lights */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-slate-900/30 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] px-4 py-6 md:py-0 animate-fadeIn">
        <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-modal overflow-hidden">
          {/* Top accent line */}
          <div className="h-[3px] bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600/20" />

          <div className="p-8 sm:p-10 text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Clock size={32} className="text-blue-400" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cuenta en revisión
            </h1>

            {/* Message */}
            <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-xs mx-auto">
              Tu cuenta ha sido registrada correctamente. En un momento un
              administrador te asignará los permisos necesarios para acceder al
              sistema.
            </p>

            {/* Pending indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping" />
                <span className="relative rounded-full bg-amber-400 h-2 w-2" />
              </span>
              <span className="text-xs text-amber-400/80 font-medium">
                Pendiente de autorización
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-white/5" />

            {/* Support info */}
            <div className="text-left">
              <p className="text-[11px] text-white/30 uppercase tracking-[0.1em] font-medium mb-3">
                ¿Necesitas ayuda?
              </p>
              <a
                href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20asignaci%C3%B3n%20de%20roles%20-%20SSPM&body=Hola%2C%20he%20creado%20mi%20cuenta%20pero%20a%C3%BAn%20no%20tengo%20acceso%20al%20sistema.%20Solicito%20la%20asignaci%C3%B3n%20de%20mis%20roles%20correspondientes."
                className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl transition-all duration-150 active:scale-[0.99] group no-underline"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                  <Mail size={15} className="text-white/50" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/30 mb-0.5">
                    Soporte técnico · responde en 24 h
                  </p>
                  <p className="text-[13px] font-medium text-white/70 truncate">
                    sistemas@sanjuandelrio.gob.mx
                  </p>
                </div>
              </a>
            </div>

            {/* Back to login */}
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.99] no-underline"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              Volver a inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
