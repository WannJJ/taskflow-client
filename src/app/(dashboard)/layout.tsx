"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {/*
        Cấu trúc responsive:
        ┌────────────────────────────────────────┐
        │  Sidebar (md+)    │  Navbar (sticky)  │
        │  w-64 fixed       │  h-16 border-b    │
        │  border-r         │                   │
        ├───────────────────┼───────────────────┤
        │                   │  Content          │
        │  Navigation       │  flex-1           │
        │  Links            │  overflow-auto    │
        │                   │  p-4 sm:p-6 lg:p-8│
        └───────────────────┴───────────────────┘

        Mobile (< md): Sidebar ẩn, Navbar có hamburger → mở Sheet drawer
        Desktop (md+): Sidebar cố định bên trái, content fill phần còn lại
      */}
      <div className="flex h-screen bg-background">
        {/* SIDEBAR - Desktop only */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <Sidebar />
        </aside>

        {/* MAIN AREA */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <Navbar />

          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
