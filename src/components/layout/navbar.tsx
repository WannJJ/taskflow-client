"use client";

import { Button } from "@/components/ui/button";
import { apiPublic } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Moon,
  StickyNote,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      // Gọi API logout để xóa refresh token ở server
      if (refreshToken) {
        await apiPublic.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Ignore error nếu server fail
    } finally {
      logout();
      toast.success("Đã đăng xuất");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg mr-6"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="hidden sm:inline">TaskFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 md:gap-4 text-sm font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            href="/tasks"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden md:inline">Tasks</span>
          </Link>
          <Link
            href="/notes"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <StickyNote className="h-4 w-4" />
            <span className="hidden md:inline">Notes</span>
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm hidden md:inline">
              {user?.displayName || user?.email}
            </span>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
