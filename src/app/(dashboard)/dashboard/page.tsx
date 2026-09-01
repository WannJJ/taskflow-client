"use client";

import { RecentNotes } from "@/components/dashboard/recent-notes";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Dashboard Overview Page
 *
 * Hiển thị:
 * 1. Welcome message (theo giờ trong ngày)
 * 2. Stats cards (4 cards)
 * 3. Quick Actions
 * 4. Recent Tasks + Recent Notes
 *
 * Responsive:
 * - Mobile: 1 cột cho stats, stack cho recent items
 * - Tablet: 2 cột cho stats
 * - Desktop: 4 cột cho stats, 2 cột cho recent items
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const {
    data: tasks,
    loading: tasksLoading,
    execute: fetchTasks,
  } = useApi<any[]>();
  const {
    data: notes,
    loading: notesLoading,
    execute: fetchNotes,
  } = useApi<any[]>();

  useEffect(() => {
    fetchTasks(() => api.get("/tasks"));
    fetchNotes(() => api.get("/notes"));
  }, [fetchTasks, fetchNotes]);

  const totalTasks = tasks?.length || 0;
  const doneTasks = tasks?.filter((t: any) => t.status === "DONE").length || 0;
  const inProgressTasks =
    tasks?.filter((t: any) => t.status === "IN_PROGRESS").length || 0;
  const overdueTasks =
    tasks?.filter((t: any) => {
      if (!t.dueDate || t.status === "DONE") return false;
      return new Date(t.dueDate) < new Date();
    }).length || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const isLoading = tasksLoading || notesLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()}, {user?.displayName || user?.email?.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Đây là tổng quan công việc của bạn hôm nay.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Task mới
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <StickyNote className="h-4 w-4" />
            Ghi chú
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng task"
          value={totalTasks}
          icon={ListTodo}
          description={`${doneTasks} đã hoàn thành`}
          trend="neutral"
          loading={isLoading}
        />
        <StatsCard
          title="Hoàn thành"
          value={doneTasks}
          icon={CheckCircle2}
          description={
            totalTasks > 0
              ? `${Math.round((doneTasks / totalTasks) * 100)}% tổng số`
              : "0%"
          }
          trend="up"
          loading={isLoading}
        />
        <StatsCard
          title="Đang làm"
          value={inProgressTasks}
          icon={Clock}
          description="Đang tiến hành"
          trend="neutral"
          loading={isLoading}
        />
        <StatsCard
          title="Quá hạn"
          value={overdueTasks}
          icon={AlertTriangle}
          description={
            overdueTasks > 0 ? "Cần xử lý ngay" : "Không có task quá hạn"
          }
          trend={overdueTasks > 0 ? "down" : "neutral"}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <RecentTasks tasks={tasks || []} loading={tasksLoading} />
        <RecentNotes notes={notes || []} loading={notesLoading} />
      </div>
    </div>
  );
}
