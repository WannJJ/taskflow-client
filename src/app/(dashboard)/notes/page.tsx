"use client";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  useUpdateNote,
} from "@/hooks/use-notes";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, FileText, Pin, Plus, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * NotesPage — Giao diện quản lý ghi chú 2 cột.
 *
 * Layout:
 * - Left Sidebar (w-80): Danh sách notes + search + "New Note" button.
 * - Right Main: Editor với title input + TipTap + metadata.
 *
 * 🧠 State Management:
 * - selectedNoteId: note đang được chọn để edit.
 * - title: controlled input cho tiêu đề (cập nhật real-time).
 * - content: nhận từ RichTextEditor qua onChange.
 * - isDirty: đánh dấu có thay đổi chưa save (để hiện "Saving..." / "Saved").
 *
 * 🧠 Auto-save:
 * - Dùng useRef để lưu timeoutId, clear cũ trước khi set mới.
 * - Debounce 1.5 giây sau khi user ngừng gõ.
 */
export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================== STATE ====================
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    searchParams.get("id"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Ref cho debounce auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== DATA FETCHING ====================
  const { data: notes, isLoading: notesLoading } = useNotes({
    search: searchQuery || undefined,
  });

  const { data: activeNote } = useNote(selectedNoteId);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  // ==================== EFFECTS ====================

  // Khi activeNote thay đổi (do fetch từ API), đồng bộ vào local state
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content || "");
      setIsDirty(false);
    } else if (!selectedNoteId) {
      // Reset khi không chọn note nào
      setTitle("");
      setContent("");
      setIsDirty(false);
    }
  }, [activeNote, selectedNoteId]);

  // ==================== HANDLERS ====================

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    // Cập nhật URL để user có thể refresh hoặc share link
    router.push(`/notes?id=${id}`, { scroll: false });
  };

  const handleCreateNote = async () => {
    const newNote = await createNote.mutateAsync({
      title: "Ghi chú mới",
      content: "",
    });
    // Chuyển sang note vừa tạo
    handleSelectNote(newNote.id);
  };

  /**
   * Auto-save logic với debounce.
   * Mỗi lần title hoặc content thay đổi:
   * 1. Đánh dấu isDirty = true.
   * 2. Clear timeout cũ.
   * 3. Set timeout mới 1.5s → gọi API update.
   */
  const triggerAutoSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (!selectedNoteId) return;

      setIsDirty(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        updateNote.mutate({
          id: selectedNoteId,
          title: newTitle,
          content: newContent,
        });
        setIsDirty(false);
      }, 1500);
    },
    [selectedNoteId, updateNote],
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutoSave(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerAutoSave(title, val);
  };

  const handlePinToggle = () => {
    if (!activeNote) return;
    updateNote.mutate({
      id: activeNote.id,
      isPinned: !activeNote.isPinned,
    });
  };

  const handleDelete = () => {
    if (!selectedNoteId) return;
    if (confirm("Bạn có chắc muốn xóa ghi chú này?")) {
      deleteNote.mutate(selectedNoteId);
      setSelectedNoteId(null);
      router.push("/notes", { scroll: false });
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* ========== LEFT SIDEBAR ========== */}
      <aside className="w-80 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Ghi chú</h2>
            <Button
              size="sm"
              onClick={handleCreateNote}
              disabled={createNote.isPending}
            >
              <Plus className="w-4 h-4 mr-1" />
              Mới
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto">
          {notesLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : notes?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Chưa có ghi chú nào</p>
              <Button
                variant="link"
                onClick={handleCreateNote}
                className="mt-2"
              >
                Tạo ghi chú đầu tiên
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {notes?.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-accent/50 transition-colors",
                    selectedNoteId === note.id && "bg-accent",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-medium truncate",
                          !note.title && "text-muted-foreground italic",
                        )}
                      >
                        {note.title || "Không có tiêu đề"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {/* Hiển thị preview: nếu content là JSON thì khó đọc, nên hiện "Đã có nội dung" */}
                        {note.content
                          ? "Đã có nội dung..."
                          : "Chưa có nội dung"}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </div>
                    </div>
                    {note.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ========== RIGHT EDITOR ========== */}
      <main className="flex-1 flex flex-col bg-background">
        {selectedNoteId ? (
          <>
            {/* Toolbar meta */}
            <div className="flex items-center justify-between px-6 py-3 border-b">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isDirty ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Đã lưu
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePinToggle}
                  className={cn(activeNote?.isPinned && "text-primary")}
                >
                  <Pin
                    className={cn(
                      "w-4 h-4",
                      activeNote?.isPinned && "fill-primary",
                    )}
                  />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Title Input */}
            <div className="px-6 pt-6 pb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Tiêu đề ghi chú..."
                className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* TipTap Editor */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto">
              <RichTextEditor
                key={selectedNoteId} // ⬅️ KEY QUAN TRỌNG: force re-mount khi đổi note
                initialContent={content}
                onChange={handleContentChange}
                className="min-h-[500px]"
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Chọn một ghi chú để bắt đầu</p>
            <p className="text-sm mt-1">hoặc tạo ghi chú mới</p>
            <Button className="mt-6" onClick={handleCreateNote}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo ghi chú
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
