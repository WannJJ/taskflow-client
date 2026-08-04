import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 🧠 GIẢI THÍCH MIDDLEWARE TRONG NEXT.JS 14:
 *
 * Middleware chạy ở EDGE (trước khi request đến page/component).
 * Nó rất nhanh nhưng có hạn chế: KHÔNG thể truy cập localStorage (vì chạy ở server).
 *
 * → Chúng ta dùng Middleware cho:
 *    - Redirect cơ bản (ví dụ: / → /dashboard)
 *    - Kiểm tra cookie nếu có
 *
 * → Client-side guard (dùng Zustand) sẽ xử lý phần kiểm tra auth thực sự.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root → dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Các trang auth không cần xử lý gì thêm
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Chạy middleware cho tất cả routes trừ static files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
