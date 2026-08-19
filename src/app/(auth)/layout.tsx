"use client";

import { GuestGuard } from "@/components/auth-guard";
import { ReactNode } from "react";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <div className="min-h-screen w-full flex">
        {/* ========== LEFT SIDE: Branding (ẩn trên mobile) ========== */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-violet-700/80 to-slate-950/95 z-10" />
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-20 flex flex-col justify-between p-12 text-white">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight">
                  TaskFlow
                </span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-snug xl:leading-tight mb-6">
                Quản lý công việc
                <br />
                <span className="text-indigo-200">thông minh hơn</span>
              </h1>
              <p className="text-lg text-indigo-100/80 max-w-md leading-relaxed">
                Tổ chức tasks, ghi chú và deadlines của bạn trong một không gian
                duy nhất. Tăng năng suất với Kanban board và rich-text editor.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-indigo-200/60">
              <span>© 2026 TaskFlow</span>
              <span>•</span>
              <span>Portfolio Project</span>
            </div>
          </div>
        </div>

        {/* ========== RIGHT SIDE: Form ========== */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </GuestGuard>
  );
}
