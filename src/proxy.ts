import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { buildCsp, generateNonce } from "@/lib/server/csp";

/**
 * Dua tanggung jawab digabung di sini karena keduanya HARUS jalan di setiap request halaman:
 * 1. Gerbang UX (redirect ke /login). BUKAN batas keamanan: cookie hanya dicek keberadaannya.
 *    Otorisasi sebenarnya ada di setiap route handler (getToken) dan backend.
 *    Jangan memindahkan pemeriksaan akses ke sini saja (lihat CVE-2025-29927).
 * 2. Nonce CSP per-request (lihat lib/server/csp.ts untuk detail kenapa harus di sini,
 *    bukan next.config.ts). Header keamanan LAIN yang statis (tanpa nonce) ada di next.config.ts.
 */
export function proxy(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    if (pathname.startsWith("/_next")) return NextResponse.next();

    const nonce = generateNonce();
    const csp = buildCsp(nonce);

    // Diteruskan sebagai request header supaya Server Component (app/layout.tsx) bisa
    // membacanya lewat headers() dan mengopernya ke elemen yang butuh (mis. ThemeProvider).
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    const withNonceRequest = { request: { headers: requestHeaders } };

    const hasSession = req.cookies.has(SESSION_COOKIE_NAME);
    let response: NextResponse;

    if (pathname === "/login") {
        response = hasSession
            ? NextResponse.redirect(new URL("/", req.url))
            : NextResponse.next(withNonceRequest);
    } else if (!hasSession) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", pathname + search);
        response = NextResponse.redirect(url);
    } else {
        response = NextResponse.next(withNonceRequest);
    }

    response.headers.set("Content-Security-Policy", csp);
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};