import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";


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