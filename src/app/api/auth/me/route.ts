import { backendFetch } from "@/lib/server/backend";
import { BACKEND_PATHS } from "@/lib/server/backend_paths";
import { refreshAccessToken } from "@/lib/server/refresh";
import { jsonError } from "@/lib/server/responses";
import { clearToken, getToken } from "@/lib/server/sessions";
import type { AuthUser } from "@/services/api/auth/types";

interface Envelope<T> {
    meta: { code: number; status: "success" | "error"; message: string };
    data: T;
}

async function fetchMe(token?: string) {
    const res = await backendFetch(BACKEND_PATHS.me, token ? { token } : {});
    const body = (await res.json().catch(() => null)) as Envelope<AuthUser> | null;
    const status = body?.meta?.status === "error" ? body.meta.code : res.status;
    return { status, body };
}

export async function GET() {
    if (!(await getToken())) return jsonError(401, "Belum login.");

    let status: number;
    let body: Envelope<AuthUser> | null;
    try {
        ({ status, body } = await fetchMe());
    } catch {
        return jsonError(504, "Server tidak merespons.");
    }

    if (status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
            return jsonError(401, "Sesi berakhir.");
        }
        try {
            ({ status, body } = await fetchMe(newToken));
        } catch {
            return jsonError(504, "Server tidak merespons.");
        }
        if (status === 401) {
            await clearToken();
            return jsonError(401, "Sesi berakhir.");
        }
    }

    if (status < 200 || status >= 300 || !body) {
        if (process.env.NODE_ENV !== "production") {
            console.error(`[me] backend returned ${status}`, body);
        }
        return jsonError(status >= 500 ? 502 : 400, "Gagal memuat profil.");
    }

    return Response.json(body.data);
}