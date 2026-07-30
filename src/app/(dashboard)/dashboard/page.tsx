"use client";

import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">
        Chào mừng, {user?.displayName || user?.email}!
      </h2>
      <p className="text-muted-foreground">
        Đây là Dashboard. Tiếp theo chúng ta sẽ xây dựng Kanban Board, Notes,
        Calendar...
      </p>
    </div>
  );
}
