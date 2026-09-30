import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const REFRESH_MAX_AGE_FALLBACK = 30 * 24 * 60 * 60; // 30 hari, dipakai bila exp tak terbaca dari token

export async function getToken(): Promise<string | undefined> {
    return (await cookies()).get(env.SESSION_COOKIE_NAME)?.value;
}

export async function setToken(token: string, maxAgeSeconds = 60 * 60) {
    (await cookies()).set(env.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: maxAgeSeconds,
    });
}

export async function clearToken() {
    (await cookies()).delete(env.SESSION_COOKIE_NAME);
}

export async function getRefreshToken(): Promise<string | undefined> {
    return (await cookies()).get(env.REFRESH_COOKIE_NAME)?.value;
}

export async function setRefreshToken(token: string, maxAgeSeconds = REFRESH_MAX_AGE_FALLBACK) {
    (await cookies()).set(env.REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // Refresh dipicu OTOMATIS di server (dalam proxy [...path] & /auth/me), bukan lewat
        // endpoint yang dipanggil browser secara langsung, jadi cookie ini harus ikut
        // terkirim di setiap request /api/*. Dibatasi ke /api (bukan "/") supaya token
        // berumur panjang ini tidak ikut terkirim di request halaman/aset statis.
        path: "/api",
        maxAge: maxAgeSeconds,
    });
}

export async function clearRefreshToken() {
    (await cookies()).delete({ name: env.REFRESH_COOKIE_NAME, path: "/api" });
}