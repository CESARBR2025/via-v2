// src/app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/service";


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  console.log("Session en layout protegido:", session); // Debug: Ver qué sesión se obtiene

  // Bloqueo de seguridad: Si intentan entrar a subrutas sin sesión
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">



      <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {children} {/* Aquí se renderizan dinámicamente mesas/page.tsx u ordenes/page.tsx */}
      </main>
    </div>
  );
}