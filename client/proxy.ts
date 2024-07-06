import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/cart",
    "/checkout/:path*",
    "/listings/:path*",
    "/delivery",
    "/admin/:path*",
  ],
};
