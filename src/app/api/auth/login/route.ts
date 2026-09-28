import { z } from "zod";
import { backendFetch } from "@/lib/server/backend";
import { isTrustedMutation } from "@/lib/server/csrf";
import { getJwtExpirySeconds } from "@/lib/server/jwt";
import { createLimiter } from "@/lib/server/rate-limit";
import { jsonError } from "@/lib/server/responses";
import type { LoginResult } from "@/services/api/auth/types";
import { setToken } from "@/lib/server/sessions";
import { getClientIp } from "@/lib/server/client-ip";

const bodySchema = z.object({
    email: z.string().trim().min(1).max(254),
    password: z.string().min(1).max(200),
});

const LOGIN_PATH = "/login";

interface Envelope<T> {
    meta: { code: number; status: "success" | "error"; message: string };
    data: T;
}

const FALLBACK_MAX_AGE = 60 * 60;
const CREDENTIAL_ERROR_CODES = new Set([400, 401, 422]);

// Hanya KEGAGALAN kredensial yang dihitung. Batas per-email dibuat lebih longgar dari
// per-IP: pelaku di banyak IP tetap tertahan, tapi user asli tidak mudah terkunci.
const WINDOW_MS = 15 * 60_000;
const ipFailures = createLimiter({ limit: 20, windowMs: WINDOW_MS });
const emailFailures = createLimiter({ limit: 10, windowMs: WINDOW_MS });

function tooManyAttempts(retryAfterSec: number) {
    const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
    return jsonError(
        429,
        `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`,
        "RATE_LIMITED",
        { "Retry-After": String(retryAfterSec) },
    );
}

export async function POST(req: Request) {
    if (!isTrustedMutation(req)) return jsonError(403, "Permintaan tidak valid.");

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "Email dan password wajib diisi.");

    const ip = getClientIp(req.headers);
    const ipKey = ip === "unknown" ? null : ip; // tanpa IP, jangan jadikan satu bucket untuk semua orang
    const emailKey = parsed.data.email.toLowerCase();

    const wait = Math.max(ipKey ? ipFailures.retryAfter(ipKey) : 0, emailFailures.retryAfter(emailKey));
    if (wait > 0) return tooManyAttempts(wait);

    let res: Response;
    try {
        res = await backendFetch(LOGIN_PATH, {
            method: "POST",
            auth: false,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
        });
    } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("[login] backend unreachable:", e);
        return jsonError(504, "Server tidak merespons. Coba lagi.");
    }

    const body = (await res.json().catch(() => null)) as Envelope<Partial<LoginResult>> | null;
    const effectiveStatus = body?.meta?.status === "error" ? body.meta.code : res.status;

    if (res.ok && body?.meta?.status !== "error") {
        const token = body?.data?.token;
        if (!token) return jsonError(502, "Respons login tidak valid (token tidak ditemukan).");

        emailFailures.reset(emailKey);
        await setToken(token, getJwtExpirySeconds(token) ?? FALLBACK_MAX_AGE);
        return Response.json({ ok: true, user: body?.data?.user ?? null });
    }

    if (effectiveStatus === 429) return jsonError(429, "Terlalu banyak percobaan. Coba lagi nanti.");

    if (CREDENTIAL_ERROR_CODES.has(effectiveStatus)) {
        if (ipKey) ipFailures.hit(ipKey);
        emailFailures.hit(emailKey);
        return jsonError(401, "Email atau password salah.");
    }

    if (process.env.NODE_ENV !== "production") {
        console.error(`[login] backend returned ${effectiveStatus} for ${res.url}`, body);
    }
    return jsonError(502, "Layanan login tidak tersedia.");
}