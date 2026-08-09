"use client";

import { api } from "@/lib/api";
import { Task, TaskStatus } from "@/types/task";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * ============================================
 * KEY FACTORY - Quản lý cache keys
 * ============================================
 * Giúp invalidate đúng cache khi có thay đổi
 */
const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * ============================================
 * HOOK: Lấy danh sách Task
 * ============================================
 * Tự động cache, refetch khi focus window
 * Dùng cho cả Kanban Board và Task List
 */
export function useTasks(filters?: {
  status?: TaskStatus;
  priority?: string;
  projectId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: taskKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.projectId) params.append("projectId", filters.projectId);
      if (filters?.search) params.append("search", filters.search);

      const res = await api.get(`/tasks?${params.toString()}`);
      return res.data.data as Task[];
    },
  });
}

/**
 * ============================================
 * HOOK: Tạo Task mới
 * ============================================
 * Sau khi tạo thành công → invalidate cache để list tự động refresh
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: string;
      dueDate?: string;
      projectId: string;
    }) => {
      const res = await api.post("/tasks", data);
      return res.data.data as Task;
    },
    onSuccess: () => {
      // Xóa cache list → tự động refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Đã tạo công việc mới!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Tạo công việc thất bại",
      );
    },
  });
}

/**
 * ============================================
 * HOOK: Cập nhật Task
 * ============================================
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const res = await api.patch(`/tasks/${id}`, data);
      return res.data.data as Task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.id),
      });
      toast.success("Cập nhật thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Cập nhật thất bại");
    },
  });
}

/**
 * ============================================
 * HOOK: Di chuyển Task (Kanban Drag & Drop)
 * ============================================
 * Tách riêng để xử lý optimistic update nhanh hơn
 */
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      position,
    }: {
      id: string;
      status: TaskStatus;
      position: number;
    }) => {
      const res = await api.patch(`/tasks/${id}/move`, { status, position });
      return res.data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Di chuyển thất bại");
      // Nếu lỗi, cache sẽ tự refetch và UI snap về vị trí cũ
    },
  });
}

/**
 * ============================================
 * HOOK: Xóa Task
 * ============================================
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/tasks/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Đã xóa công việc");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Xóa thất bại");
    },
  });
}
