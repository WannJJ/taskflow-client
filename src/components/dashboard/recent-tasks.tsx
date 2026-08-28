"use client";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";

type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
}

interface RecentTasksProps {
  tasks: Task[];
  loading?: boolean;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; icon: typeof Circle; color: string }
> = {
  BACKLOG: { label: "Backlog", icon: Circle, color: "bg-slate-500" },
  TODO: { label: "Todo", icon: Circle, color: "bg-gray-500" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "bg-blue-500" },
  DONE: { label: "Done", icon: CheckCircle2, color: "bg-green-500" },
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  MEDIUM:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  URGENT:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function RecentTasks({ tasks, loading = false }: RecentTasksProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[150px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CheckCircle2}
            title="Chưa có task nào"
            description="Tạo task đầu tiên để bắt đầu quản lý công việc."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks gần đây</CardTitle>
        <Link href="/tasks" className="text-sm text-primary hover:underline">
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.slice(0, 5).map((task) => {
          const StatusIcon = statusConfig[task.status].icon;
          return (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent group"
            >
              <div
                className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${statusConfig[task.status].color}`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {task.title}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">
                    {task.description}
                  </p>
                )}
              </div>

              {task.dueDate && (
                <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
                  {new Date(task.dueDate).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
