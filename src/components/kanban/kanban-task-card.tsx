"use client";

import { cn } from "@/lib/utils";
import { PRIORITY_COLORS, PRIORITY_LABELS, Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, GripVertical, Pencil, Trash2 } from "lucide-react";

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

/**
 * ============================================
 * KANBAN TASK CARD
 * ============================================
 * Hiển thị 1 task trong cột Kanban
 * Có thể kéo thả (dnd-kit sortable)
 */
export function KanbanTaskCard({
  task,
  onEdit,
  onDelete,
}: KanbanTaskCardProps) {
  // useSortable cung cấp các thuộc tính để kéo thả
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // Style transform để di chuyển mượt mà
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 scale-105 shadow-xl z-50",
      )}
      {...attributes}
      {...listeners}
    >
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>

        {/* Actions (hiện khi hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Tránh trigger drag
              onEdit(task);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <Pencil className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 hover:bg-red-100 rounded"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm mb-1 line-clamp-2">{task.title}</h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer: Due Date & Labels */}
      <div className="flex items-center justify-between mt-2">
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {format(new Date(task.dueDate), "dd/MM", { locale: vi })}
            </span>
          </div>
        )}

        {/* Labels */}
        <div className="flex gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      </div>

      {/* Drag Handle Indicator */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-1 opacity-0 group-hover:opacity-30">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}
