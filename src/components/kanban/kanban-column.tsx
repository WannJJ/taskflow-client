"use client";

import { cn } from "@/lib/utils";
import { KanbanColumnConfig, Task, TaskStatus } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { KanbanTaskCard } from "./kanban-task-card";

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

/**
 * ============================================
 * KANBAN COLUMN
 * ============================================
 * Mỗi cột là 1 vùng droppable (thả task vào)
 * Chứa danh sách task có thể sort (kéo thả reorder)
 */
export function KanbanColumn({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: KanbanColumnProps) {
  // useDroppable: đánh dấu cột này là nơi có thể thả task
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col w-80 min-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Column Body - Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 bg-muted/50 rounded-xl p-2 min-h-[200px] transition-colors",
          isOver && "bg-muted ring-2 ring-primary/20", // Highlight khi kéo task vào
        )}
      >
        {/* SortableContext: cho phép reorder task trong cột */}
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Kéo thả task vào đây
          </div>
        )}
      </div>
    </div>
  );
}
