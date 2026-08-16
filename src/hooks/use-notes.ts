import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
  project: { id: string; name: string; color: string } | null;
  labels: { id: string; name: string; color: string }[];
}

/**
 * Key cho React Query cache.
 * Dùng để invalidate (làm mới) dữ liệu sau khi create/update/delete.
 */
const NOTES_KEY = "notes";

/**
 * Hook lấy danh sách notes.
 * Hỗ trợ search, filter.
 */
export function useNotes(params?: {
  search?: string;
  projectId?: string;
  isPinned?: boolean;
}) {
  return useQuery({
    queryKey: [NOTES_KEY, params],
    queryFn: async () => {
      const { data } = await api.get("/notes", { params });
      return data.data as Note[];
    },
  });
}

/**
 * Hook lấy chi tiết 1 note.
 */
export function useNote(noteId: string | null) {
  return useQuery({
    queryKey: [NOTES_KEY, noteId],
    queryFn: async () => {
      if (!noteId) return null;
      const { data } = await api.get(`/notes/${noteId}`);
      return data.data as Note;
    },
    enabled: !!noteId, // Chỉ chạy khi noteId có giá trị
  });
}

/**
 * Hook tạo note mới.
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content?: string;
      isPinned?: boolean;
    }) => {
      const { data } = await api.post("/notes", payload);
      return data.data as Note;
    },
    onSuccess: () => {
      // Invalidate cache để list tự động refetch
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
      toast.success("Đã tạo ghi chú mới");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Tạo ghi chú thất bại",
      );
    },
  });
}

/**
 * Hook cập nhật note.
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Note>) => {
      const { data } = await api.patch(`/notes/${id}`, payload);
      return data.data as Note;
    },
    onSuccess: (_, variables) => {
      // Invalidate cả list và detail
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY, variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Cập nhật thất bại");
    },
  });
}

/**
 * Hook xóa note.
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_KEY] });
      toast.success("Đã xóa ghi chú");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Xóa thất bại");
    },
  });
}
