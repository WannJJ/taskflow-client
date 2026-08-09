/**
 * ============================================
 * TASK TYPES - Định nghĩa kiểu dữ liệu cho Task
 * ============================================
 * Dùng chung cho cả API response và UI components
 */

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  color: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null; // ISO string từ API
  position: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  projectId: string;
  project: Project | null;
  labels: Label[];
}

/**
 * Cấu hình cho Kanban Column
 * Mỗi cột đại diện cho 1 status
 */
export interface KanbanColumnConfig {
  id: TaskStatus;
  title: string;
  color: string; // Mã màu cho badge/header
}

/**
 * Cấu hình mặc định cho 4 cột Kanban
 */
export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: "BACKLOG", title: "Backlog", color: "#6B7280" },
  { id: "TODO", title: "Cần làm", color: "#3B82F6" },
  { id: "IN_PROGRESS", title: "Đang làm", color: "#F59E0B" },
  { id: "DONE", title: "Hoàn thành", color: "#10B981" },
];

/**
 * Màu sắc cho Priority badge
 */
export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "#10B981", // Xanh lá
  MEDIUM: "#F59E0B", // Vàng
  HIGH: "#EF4444", // Đỏ
  URGENT: "#7C3AED", // Tím
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};
