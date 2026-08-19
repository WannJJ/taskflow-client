"use client";

import { useDeleteTask, useMoveTask, useTasks } from "@/hooks/use-tasks";
import { KANBAN_COLUMNS, Task, TaskStatus } from "@/types/task";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useState } from "react";
import { KanbanColumn } from "./kanban-column";
import { KanbanTaskCard } from "./kanban-task-card";

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
}

/**
 * ============================================
 * KANBAN BOARD - COMPONENT CHÍNH
 * ============================================
 * Quản lý toàn bộ logic drag & drop
 * Bao gồm: DndContext, Sensors, DragOverlay
 */
export function KanbanBoard({ onEditTask }: KanbanBoardProps) {
  // Lấy danh sách task từ API
  const { data: tasks = [], isLoading } = useTasks();
  const moveTask = useMoveTask();
  const deleteTask = useDeleteTask();

  // State quản lý task local (để UI phản hồi ngay lập tức - Optimistic Update)
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Task đang được kéo (để hiển thị DragOverlay)
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Đồng bộ localTasks khi API data thay đổi
  useState(() => {
    setLocalTasks(tasks);
  });

  // Cấu hình Sensors: Pointer (chuột/cảm ứng) + Keyboard (accessibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Kéo ít nhất 5px mới bắt đầu drag (tránh click nhầm)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   * Bắt đầu kéo: Lưu task đang active để hiển thị overlay
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = localTasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [localTasks],
  );

  /**
   * Kết thúc kéo: Cập nhật status/position và gọi API
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Tìm task đang kéo
      const activeTaskIndex = localTasks.findIndex((t) => t.id === activeId);
      if (activeTaskIndex === -1) return;

      const activeTask = localTasks[activeTaskIndex];

      // Case 1: Thả vào 1 cột (overId là status: TODO, IN_PROGRESS...)
      const isOverColumn = KANBAN_COLUMNS.some((col) => col.id === overId);

      // Case 2: Thả vào 1 task khác (overId là taskId)
      const overTask = localTasks.find((t) => t.id === overId);
      const overStatus = isOverColumn
        ? (overId as TaskStatus)
        : overTask?.status;

      if (!overStatus) return;

      // Nếu không đổi cột và không đổi vị trí → bỏ qua
      if (activeTask.status === overStatus && !isOverColumn) {
        // Có thể là reorder trong cùng cột - xử lý sau
        return;
      }

      // Tính position mới trong cột đích
      const tasksInTargetColumn = localTasks
        .filter((t) => t.status === overStatus)
        .sort((a, b) => a.position - b.position);

      let newPosition: number;
      if (isOverColumn) {
        // Thả vào cột rỗng hoặc cuối cột
        newPosition =
          tasksInTargetColumn.length > 0
            ? tasksInTargetColumn[tasksInTargetColumn.length - 1].position + 1
            : 0;
      } else if (overTask) {
        // Thả vào trước task đích
        newPosition = overTask.position;
      } else {
        newPosition = 0;
      }

      // Optimistic Update: Cập nhật UI ngay lập tức
      const updatedTasks = localTasks.map((t) =>
        t.id === activeId
          ? { ...t, status: overStatus, position: newPosition }
          : t,
      );
      setLocalTasks(updatedTasks);

      // Gọi API để lưu thay đổi
      moveTask.mutate({
        id: activeId,
        status: overStatus,
        position: newPosition,
      });
    },
    [localTasks, moveTask],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="w-80 min-w-[320px]">
            <div className="h-8 w-32 bg-muted animate-pulse rounded mb-3" />
            <div className="bg-muted/50 rounded-xl p-2 min-h-[200px] space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Nhóm task theo status để render từng cột
  const tasksByColumn = KANBAN_COLUMNS.map((col) => ({
    ...col,
    tasks: localTasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.position - b.position),
  }));

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners} // Thuật toán phát hiện va chạm góc gần nhất
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {tasksByColumn.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={column.tasks}
              onEditTask={onEditTask}
              onDeleteTask={(id) => deleteTask.mutate(id)}
              onAddTask={(status) => console.log("Add to", status)}
            />
          ))}
        </div>

        {/* DragOverlay: Hiển thị task đang kéo (to hơn, mờ hơn) */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-2 scale-105">
              <KanbanTaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
