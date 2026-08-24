"use client";

import { cn } from "@/lib/utils";

/**
 * Loading Spinner
 * Hiển thị vòng xoay khi đang xử lý (submit form, load data)
 *
 * Kích thước:
 * - sm: 16px (inline, trong button)
 * - md: 24px (card loading)
 * - lg: 32px (page loading)
 * - xl: 48px (fullscreen loading)
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-12 w-12 border-4",
};

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-current border-t-transparent",
        sizeMap[size],
        className,
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}
