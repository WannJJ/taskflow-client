"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { AlertCircle, CheckSquare, Clock, StickyNote } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  // TODO: Sau này fetch real data từ API
  const stats = [
    {
      title: "Tổng Task",
      value: "12",
      icon: CheckSquare,
      color: "text-blue-500",
    },
    { title: "Đang làm", value: "5", icon: Clock, color: "text-yellow-500" },
    {
      title: "Hoàn thành",
      value: "4",
      icon: CheckSquare,
      color: "text-green-500",
    },
    {
      title: "Ghi chú",
      value: "8",
      icon: StickyNote,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Chào mừng, {user?.displayName || user?.email}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Đây là tổng quan công việc của bạn hôm nay.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions / Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Tiếp theo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Phase 1 & 2 hoàn thành: Auth System đã chạy ổn định</p>
          <p>🔄 Phase 3 sắp tới: Task CRUD + Kanban Board với Drag & Drop</p>
          <p>📝 Phase 4: Notes với Rich Text Editor</p>
        </CardContent>
      </Card>
    </div>
  );
}
