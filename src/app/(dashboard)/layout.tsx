import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard (backup)
  const token = cookies().get("accessToken")?.value;
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex h-screen">
        <aside className="w-64 border-r bg-white dark:bg-zinc-900 hidden md:block">
          <div className="p-4 font-bold text-xl">TaskFlow</div>
          <nav className="px-4 space-y-2">
            <a
              href="/dashboard"
              className="block p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Dashboard
            </a>
            <a
              href="/tasks"
              className="block p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Tasks
            </a>
            <a
              href="/notes"
              className="block p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Notes
            </a>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
