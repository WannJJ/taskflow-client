"use client";

import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin, StickyNote } from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  updatedAt: string;
}

interface RecentNotesProps {
  notes: Note[];
  loading?: boolean;
}

function stripHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function RecentNotes({ notes, loading = false }: RecentNotesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[150px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ghi chú gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={StickyNote}
            title="Chưa có ghi chú nào"
            description="Tạo ghi chú đầu tiên để lưu ý tưởng và thông tin quan trọng."
          />
        </CardContent>
      </Card>
    );
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ghi chú gần đây</CardTitle>
        <Link href="/notes" className="text-sm text-primary hover:underline">
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedNotes.slice(0, 5).map((note) => {
          const preview = stripHtml(note.content).slice(0, 80);
          return (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block rounded-lg p-2 transition-colors hover:bg-accent group"
            >
              <div className="flex items-center gap-2">
                {note.isPinned && (
                  <Pin className="h-3 w-3 text-primary shrink-0" />
                )}
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {note.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 pl-5">
                {preview || "Không có nội dung"}
              </p>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
