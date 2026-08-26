import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading UI - Next.js tự động hiển thị khi route đang load
 *
 * Hiển thị khi nào:
 * - Chuyển route trong App Router
 * - Suspense boundary trigger
 * - Server Component đang fetch data
 *
 * Thiết kế: Skeleton screens thay vì spinner
 * bởi vì Skeleton giảm "cảm giác chờ đợi" (perceived performance)
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-8 w-[60px]" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow space-y-4">
          <Skeleton className="h-5 w-[150px]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-6 shadow space-y-4">
          <Skeleton className="h-5 w-[150px]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
