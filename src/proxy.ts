import { NextResponse, type NextRequest } from "next/server";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "pm_token";

export function proxy(req: NextRequest) {

    const { pathname, search } = req.nextUrl;
    const hasSession = req.cookies.has(COOKIE);

    if (pathname === '/login') {
        return hasSession ? NextResponse.redirect(new URL('/', req.url)) : NextResponse.next();
    }

    if (!hasSession) {

        const url = new URL('/login', req.url);
        url.searchParams.set('next', pathname + search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {

    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}