"use client";

import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

/**
 * 404 Not Found Page
 *
 * Next.js tự động hiển thị file này khi:
 * - URL không khớp với bất kỳ route nào
 * - Gọi notFound() trong Server Component
 */
export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
      <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
        Trang không tồn tại
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không
        khả dụng.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Home className="h-4 w-4" />
        Về Dashboard
      </Link>
    </div>
  );
}
