import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hàm tiện ích kết hợp clsx + tailwind-merge
 * Dùng để merge className động một cách an toàn
 *
 * Ví dụ: cn("px-4", isActive && "bg-blue-500", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
