"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CheckSquare className="h-7 w-7" />
          Quản lý Task
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kanban Board</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Đang xây dựng... Phase 3 sẽ có Kanban Board với Drag & Drop!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
