"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * ModeToggle - Nút chuyển đổi Dark/Light Mode
 *
 * Kỹ thuật quan trọng:
 * 1. useTheme() từ next-themes: lấy theme hiện tại và hàm setTheme
 * 2. mounted state: TRÁNH hydration mismatch!
 *    - Next.js render HTML ở server (không biết dark/light)
 *    - Client render lại có thể khác
 *    - Nếu render icon khác nhau → lỗi hydration
 *    - Giải pháp: chỉ render sau khi component mount (useEffect)
 * 3. transition-colors: hiệu ứng chuyển màu mượt
 */
export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Chỉ render sau khi mount để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder có cùng kích thước để tránh layout shift
    return <div className={cn("h-9 w-9 rounded-md", className)} />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all",
          theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all",
          theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0",
        )}
      />
    </button>
  );
}
