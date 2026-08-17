"use client";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { Layout, List } from "lucide-react";
import { useState } from "react";

type ViewMode = "kanban" | "list";

/**
 * ============================================
 * TASKS PAGE
 * ============================================
 * Trang quản lý công việc chính
 * Hỗ trợ 2 chế độ xem: Kanban Board và List View
 */
export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  // Quản lý dialog edit
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  /**
   * Mở dialog edit
   * Được truyền xuống KanbanBoard → KanbanColumn → KanbanTaskCard
   */
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Công việc</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý và theo dõi tiến độ công việc của bạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <Layout className="w-4 h-4 mr-1" />
              Board
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          {/* Create Button */}
          <CreateTaskDialog />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "kanban" ? (
          <KanbanBoard onEditTask={handleEditTask} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chế độ xem danh sách sẽ được implement sau</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
