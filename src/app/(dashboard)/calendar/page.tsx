"use client";

import { Construction } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">Calendar</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Tính năng này đang được phát triển. Hãy quay lại sau nhé!
      </p>
    </div>
  );
}
