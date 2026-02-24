import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieValue,
  isAccessKeyConfigured,
} from "@/lib/auth";


export async function middleware(request: NextRequest) {
  if (!isAccessKeyConfigured()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 放行 auth 页面
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // 乐观校验：仅检查 cookie 是否存在且匹配
  const expected = await getAuthCookieValue();
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (expected && cookie === expected) {
    return NextResponse.next();
  }

  // API 返回 401，页面重定向到 auth
  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "请先完成访问验证" },
      { status: 401 }
    );
  }

  return NextResponse.redirect(new URL("/auth", request.url));
}

export const config = {
  matcher: [
    // 排除静态资源、元数据文件；API 和页面都会经过 middleware 做鉴权
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
