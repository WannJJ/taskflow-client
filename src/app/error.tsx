"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

/**
 * Error Boundary
 *
 * Trigger khi:
 * - Component render bị crash (runtime error)
 * - Lỗi trong useEffect
 * - Lỗi không được try-catch
 *
 * Kỹ thuật:
 * - "use client": Error boundary chỉ hoạt động ở Client Component
 * - Next.js tự động wrap route bằng file này
 * - reset(): gọi khi user click "Thử lại" → re-render component
 *
 * QUAN TRỌNG: Không dùng try-catch được vì đây là lỗi RENDER,
 * không phải lỗi async. Chỉ Error Boundary mới bắt được.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h2 className="mb-2 text-2xl font-bold tracking-tight">
        Ôi không! Có lỗi xảy ra
      </h2>

      <p className="mb-6 max-w-md text-muted-foreground">
        Đã có lỗi không mong muốn xảy ra. Đừng lo, dữ liệu của bạn vẫn an toàn.
        Hãy thử tải lại trang.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="mb-6 max-w-lg overflow-auto rounded-lg border bg-muted p-4 text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Error Details (dev only)
          </p>
          <code className="text-sm text-destructive break-all">
            {error.message}
          </code>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RefreshCcw className="h-4 w-4" />
          Thử lại
        </button>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Về Dashboard
        </button>
      </div>
    </div>
  );
}
