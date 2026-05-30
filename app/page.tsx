import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {children}
      </main>
    </div>
  );
}