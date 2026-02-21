import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware
 *
 * Protects /dashboard routes by checking for a valid auth token cookie.
 * - If no token cookie is found, redirects to /login.
 * - If user is already logged in and visits /login, redirects to /dashboard.
 *
 * Note: This middleware runs on the server (Edge Runtime), so it can only
 * Note: This middleware runs on the server (Edge Runtime), so it can only
 * read cookies, not localStorage. The login page stores the token in both
 * localStorage (for API calls) and a cookie (for this middleware).
 */
export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Protect admin routes: redirect to /potal-campuseye3x101 if no token
    if ((pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) && !token) {
        const loginUrl = new URL("/potal-campuseye3x101", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If user is logged in and visits the login page, redirect to /dashboard
    if (pathname === "/potal-campuseye3x101" && token) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
    matcher: ["/dashboard/:path*", "/settings/:path*", "/potal-campuseye3x101"],
};
