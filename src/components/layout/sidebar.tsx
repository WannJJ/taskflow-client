"use client";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  CalendarDays,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Search,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar Navigation
 *
 * Kỹ thuật Responsive:
 * - Desktop (md+): Hiển thị cố định bên trái, w-64
 * - Mobile (< md): Ẩn hoàn toàn, thay bằng Sheet drawer
 *
 * Navigation Items:
 * - Mỗi item có icon + label
 * - Active state: đổi màu nền + font-weight
 * - Dùng usePathname() để xác định trang hiện tại
 */
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: KanbanSquare },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Search", href: "/search", icon: Search },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={onNavigate}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KanbanSquare className="h-5 w-5" />
          </div>
          <span>TaskFlow</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={() => {
            logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
