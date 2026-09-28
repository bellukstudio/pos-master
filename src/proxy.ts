import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

/**
 * Hanya gerbang UX (redirect ke /login). BUKAN batas keamanan: cookie hanya dicek
 * keberadaannya. Otorisasi sebenarnya ada di setiap route handler (getToken) dan backend.
 * Jangan memindahkan pemeriksaan akses ke sini saja (lihat CVE-2025-29927).
 */
export function proxy(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    if (pathname.startsWith("/_next")) return NextResponse.next();
    const hasSession = req.cookies.has(SESSION_COOKIE_NAME);

    if (pathname === "/login") {
        return hasSession ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
    }

    if (!hasSession) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", pathname + search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};