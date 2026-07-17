import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Đã đăng nhập mà vào trang auth → đẩy về dashboard
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Chưa đăng nhập mà vào trang protected → đẩy về login
  if (!token && !isPublic && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
