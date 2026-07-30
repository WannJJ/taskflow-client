"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-xl">TaskFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {useAuthStore.getState().user?.email}
          </span>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              router.push("/login");
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
