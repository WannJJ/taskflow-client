"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <StickyNote className="h-7 w-7" />
          Ghi chú
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Đang xây dựng... Phase 4 sẽ có TipTap Editor!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
