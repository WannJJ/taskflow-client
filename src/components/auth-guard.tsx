"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 🛡️ AuthGuard — Client-side route protection
 *
 * Dùng trong layout của dashboard để:
 * 1. Chờ Zustand rehydrate từ localStorage (tránh flash redirect)
 * 2. Kiểm tra isAuthenticated
 * 3. Redirect về /login nếu chưa login
 *
 * Cách dùng: Bọc <AuthGuard>{children}</AuthGuard> trong layout dashboard
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Chờ rehydrate xong mới kiểm tra
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Đang loading (rehydrate từ localStorage) → hiện spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa auth → không render gì (đang redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * 🔄 GuestGuard — Ngược lại: Chỉ cho phép GUEST (chưa login)
 * Dùng cho trang Login/Register: Nếu đã login → redirect dashboard
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
