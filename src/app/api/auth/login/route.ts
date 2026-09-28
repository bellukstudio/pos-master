import { z } from "zod";
import { backendFetch } from "@/lib/server/backend";
import { isTrustedMutation } from "@/lib/server/csrf";
import { getJwtExpirySeconds } from "@/lib/server/jwt";
import { jsonError } from "@/lib/server/responses";
import type { LoginResult } from "@/services/api/auth/types";
import { setToken } from "@/lib/server/sessions";

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

export async function POST(req: Request) {
    if (!isTrustedMutation(req)) return jsonError(403, "Permintaan tidak valid.");

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "Email dan password wajib diisi.");

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

        await setToken(token, getJwtExpirySeconds(token) ?? FALLBACK_MAX_AGE);
        return Response.json({ ok: true, user: body?.data?.user ?? null });
    }

    if (effectiveStatus === 429) return jsonError(429, "Terlalu banyak percobaan. Coba lagi nanti.");



    if (CREDENTIAL_ERROR_CODES.has(effectiveStatus)) {
        return jsonError(401, "Email atau password salah.");
    }

    if (process.env.NODE_ENV !== "production") {
        console.error(`[login] backend returned ${effectiveStatus} for ${res.url}`, body);
    }
    return jsonError(502, "Layanan login tidak tersedia.");
}