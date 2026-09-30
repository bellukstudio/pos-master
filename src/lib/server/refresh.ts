import "server-only";
import { backendFetch } from "./backend";
import { BACKEND_PATHS } from "./backend_paths";
import { getJwtExpirySeconds } from "./jwt";
import { clearRefreshToken, clearToken, getRefreshToken, setRefreshToken, setToken } from "./sessions";

interface Envelope<T> {
    meta: { code: number; status: "success" | "error"; message: string };
    data: T;
}

interface RefreshData {
    token?: string;
    refreshToken?: string;
}

const ACCESS_FALLBACK_MAX_AGE = 60 * 60; // 1 jam, dipakai bila exp tak terbaca dari token baru

/**
 * Menukar refresh token dengan access token baru.
 * Beberapa request mutasi bisa mendapat 401 bersamaan (mis. beberapa tab, atau beberapa
 * fetch paralel di satu halaman); tanpa dedupe ini, semuanya akan memicu refresh sendiri-
 * sendiri ke backend. `inFlight` memastikan hanya SATU permintaan refresh berjalan per
 * instance server; permintaan lain menumpang hasil yang sama.
 * Catatan: dedupe ini per-proses. Pada deployment multi-instance, tiap instance tetap
 * bisa memulai refresh sendiri-sendiri.
 */
let inFlight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
    if (!inFlight) {
        inFlight = doRefresh().finally(() => {
            inFlight = null;
        });
    }
    return inFlight;
}

async function doRefresh(): Promise<string | null> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    let res: Response;
    try {
        res = await backendFetch(BACKEND_PATHS.refreshToken, {
            method: "POST",
            auth: false,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });
    } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("[refresh] backend unreachable:", e);
        return null; // gangguan jaringan sesaat: JANGAN hapus sesi, biarkan user coba lagi
    }

    const body = (await res.json().catch(() => null)) as Envelope<RefreshData> | null;
    const status = body?.meta?.status === "error" ? body.meta.code : res.status;

    if (status < 200 || status >= 300 || !body?.data?.token) {
        // Refresh token ditolak backend (kedaluwarsa/dicabut): sesi benar-benar berakhir.
        await clearToken();
        await clearRefreshToken();
        return null;
    }

    const newAccessToken = body.data.token;
    await setToken(newAccessToken, getJwtExpirySeconds(newAccessToken) ?? ACCESS_FALLBACK_MAX_AGE);

    // Rotasi: kalau backend mengirim refresh token baru, pakai itu & buang yang lama.
    // Kalau tidak (field tak ada), refresh token lama tetap dipakai sampai masa berlakunya habis.
    if (body.data.refreshToken) {
        const refreshExp = getJwtExpirySeconds(body.data.refreshToken);
        if (refreshExp) await setRefreshToken(body.data.refreshToken, refreshExp);
    }

    return newAccessToken;
}