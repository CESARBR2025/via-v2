import Image from 'next/image';
import Link from 'next/link';
import { Clock, Mail, ArrowLeft } from 'lucide-react';

export default function PendingApprovalPage() {
  return (
    <main className="min-h-dvh w-full overflow-x-hidden flex flex-col lg:flex-row bg-slate-50">
      {/* ─── Left Panel — Content ─── */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center px-6 py-10 lg:py-0 min-w-0 relative">
        {/* SSPM logo */}
        <div className="absolute top-8 left-12 lg:left-16 flex items-center gap-4">
          <Image
            src="/roles/Estrella.png"
            alt="SSPM"
            width={56}
            height={56}
            className="object-contain shrink-0"
            priority
          />
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight leading-none block">
              Secretaría de Seguridad
            </span>
            <span className="text-xs font-medium text-slate-400 tracking-[0.15em] uppercase leading-none mt-1.5 block">
              Pública Municipal
            </span>
          </div>
        </div>

        <div className="w-full max-w-[460px] animate-fadeIn space-y-6">
          {/* Icon & heading */}
          <div className="text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Clock size={32} className="text-blue-700" strokeWidth={1.5} />
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
              Cuenta en revisión
            </h1>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-sm mx-auto">
              Tu cuenta ha sido registrada correctamente. En un momento un
              administrador te asignará los permisos necesarios para acceder al
              sistema.
            </p>
          </div>

          {/* Pending indicator */}
          <div className="flex items-center justify-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping" />
              <span className="relative rounded-full bg-amber-400 h-2.5 w-2.5" />
            </span>
            <span className="text-sm text-amber-600 font-medium">
              Pendiente de autorización
            </span>
          </div>

          {/* Support section */}
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-center gap-2.5 w-full">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">
                ¿Necesitas ayuda?
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <a
              href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20asignaci%C3%B3n%20de%20roles%20-%20SSPM&body=Hola%2C%20he%20creado%20mi%20cuenta%20pero%20a%C3%BAn%20no%20tengo%20acceso%20al%20sistema.%20Solicito%20la%20asignaci%C3%B3n%20de%20mis%20roles%20correspondientes."
              className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-150 active:scale-[0.99] group no-underline mt-3"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                <Mail size={15} strokeWidth={1.5} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">
                  Soporte técnico · responde en 24 h
                </p>
                <p className="text-[13px] font-medium text-slate-700 truncate">
                  sistemas@sanjuandelrio.gob.mx
                </p>
              </div>
            </a>
          </div>

          {/* Back to login */}
          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-medium text-slate-400 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-200 transition-all duration-200 active:scale-[0.99] no-underline"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Volver a inicio de sesión
          </Link>
        </div>
      </div>

      {/* ─── Right Panel — Dark Branding (same as login) ─── */}
      <div className="hidden lg:flex lg:w-1/2 p-5 flex-col">
        <div className="relative flex-1 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-700/8 blur-3xl pointer-events-none" />



          {/* Top accent line */}
          <div className="relative z-10 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500/20 shrink-0" />

          <div className="relative z-10 flex-1 flex flex-col justify-between px-12 py-14 lg:py-20 lg:px-14">
            {/* ─── Collage ─── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
              {/* Tablet — simplified (2 images) */}
              <div className="hidden lg:block">
                {/* ① Dashboard — fondo abajo-derecha */}
                <div
                  style={{
                    transform:
                      'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                  }}
                  className="absolute left-[40%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-[100%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                >
                  <Image
                    fill
                    src="/login-preview/01-dashboard.png"
                    alt="Dashboard oficial"
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* ② Ubicación */}
                <div
                  style={{
                    transform:
                      'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                  }}
                  className="absolute left-[80%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                >
                  <Image
                    fill
                    src="/login-preview/02-ubicacion.png"
                    alt="Captura ubicación"
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* ③ Orden de Pago */}
                <div
                  style={{
                    transform:
                      'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                  }}
                  className="absolute left-[80%] top-[99%] -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                >
                  <Image
                    fill
                    src="/login-preview/03-orden-pago.png"
                    alt="Orden de pago"
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* ⑦ Admin KPIs — arriba */}
                <div
                  style={{
                    transform:
                      'perspective(1300px) rotateY(-15deg) rotateX(10deg) rotate(0deg)',
                  }}
                  className="absolute left-[45%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-[100%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                >
                  <Image
                    fill
                    src="/login-preview/07-dashboard-admin.png"
                    alt="Dashboard admin KPIs"
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* ⑥ Admin — centro */}
                <div
                  style={{
                    transform:
                      'perspective(1300px) rotateY(-15deg) rotateX(10deg) rotate(0deg)',
                  }}
                  className="absolute left-[70%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                >
                  <Image
                    fill
                    src="/login-preview/06-dashboard-admin.png"
                    alt="Dashboard admin"
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-950/5 via-blue-950/40 to-blue-950/95" />
            </div>


          </div>
        </div>
      </div>
    </main>
  );
}
