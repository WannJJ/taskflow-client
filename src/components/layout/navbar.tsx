"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiPublic } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import {
  CheckSquare,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ============================================
// MobileNav - Navigation trong Sheet drawer
// ============================================
function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Notes", href: "/notes", icon: StickyNote },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo trong drawer */}
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 font-bold text-lg"
        >
          <LayoutDashboard className="h-5 w-5" />
          TaskFlow
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout ở dưới cùng */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN NAVBAR
// ============================================
export function Navbar() {
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await apiPublic.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Ignore
    } finally {
      logout();
      toast.success("Đã đăng xuất");
      router.push("/login");
    }
  };

  // Nav links dùng chung cho desktop và mobile
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Notes", href: "/notes", icon: StickyNote },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* ========== LEFT: Hamburger (mobile) + Logo ========== */}
        <div className="flex items-center gap-3 mr-4">
          {/* Hamburger - chỉ hiện trên mobile (< md) */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label="Open menu">		
              
                <Menu className="h-5 w-5" />
              
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <MobileNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">TaskFlow</span>
          </Link>
        </div>

        {/* ========== CENTER: Desktop Navigation ========== */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ========== RIGHT: Actions ========== */}
        <div className="ml-auto flex items-center gap-1">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 h-9 px-3"
            >
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              <span className="hidden lg:inline text-sm">
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
              <ChevronDown className="h-3 w-3 hidden lg:inline text-muted-foreground" />
            </Button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <>
                {/* Overlay để click ra ngoài đóng menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-popover p-1 shadow-md z-50">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}