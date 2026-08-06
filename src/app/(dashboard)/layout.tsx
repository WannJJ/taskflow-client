"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto p-4 md:p-6 max-w-7xl">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
