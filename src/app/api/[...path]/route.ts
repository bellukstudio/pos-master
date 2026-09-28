import { after, type NextRequest } from "next/server";
import { describeMutation, getRequestContext, recordAudit } from "@/lib/server/audit";
import { backendFetch } from "@/lib/server/backend";
import { isTrustedMutation, SAFE_METHODS } from "@/lib/server/csrf";
import { jsonError } from "@/lib/server/responses";
import { clearToken, getToken } from "@/lib/server/sessions";

/**
 * Proxy tunggal browser -> backend. Token ditempel di server dari cookie httpOnly.
 * Backend memakai awalan /api/admin/*, jadi hanya "admin" yang diizinkan.
 * "auth" & "login" sengaja tidak ada: punya route sendiri.
 */
const ALLOWED_ROOTS = new Set(["admin"]);

const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB

type Ctx = { params: Promise<{ path: string[] }> };

// ---- Pemeriksaan akses ----

function isAllowedPath(segments: string[]): boolean {
    return segments.length > 0 && ALLOWED_ROOTS.has(segments[0]);
}

/**
 * Log audit dari browser hanya boleh DIBACA atau DIHAPUS.
 * Membuat/mengubah entri (POST/PUT/PATCH) diblokir: itu tugas server (lib/server/audit.ts),
 * supaya pelaku, cabang, IP, dan device tidak bisa dipalsukan.
 */
const AUDIT_BROWSER_METHODS = new Set(["GET", "HEAD", "OPTIONS", "DELETE"]);

function isForbiddenAuditWrite(segments: string[], method: string): boolean {
    return segments[0] === "admin" && segments[1] === "audit" && !AUDIT_BROWSER_METHODS.has(method);
}

function checkAccess(req: NextRequest, segments: string[]): Response | null {
    if (!isAllowedPath(segments)) return jsonError(404, "Endpoint tidak ditemukan.");
    if (isForbiddenAuditWrite(segments, req.method)) {
        return jsonError(403, "Log audit tidak dapat dibuat atau diubah dari browser.");
    }
    if (!SAFE_METHODS.has(req.method) && !isTrustedMutation(req)) {
        return jsonError(403, "Permintaan tidak valid.");
    }
    return null;
}

// ---- Langkah-langkah proxy ----

function toBackendPath(segments: string[]): string {
    return "/" + segments.map(encodeURIComponent).join("/");
}

async function readBody(
    req: NextRequest,
): Promise<{ ok: true; body: ArrayBuffer | undefined } | { ok: false; response: Response }> {
    if (SAFE_METHODS.has(req.method)) return { ok: true, body: undefined };

    const body = await req.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
        return { ok: false, response: jsonError(413, "Data terlalu besar.") };
    }
    return { ok: true, body };
}

async function forwardToBackend(
    req: NextRequest,
    path: string,
    body: ArrayBuffer | undefined,
): Promise<{ ok: true; response: Response } | { ok: false; response: Response }> {
    const contentType = req.headers.get("content-type");

    try {
        const res = await backendFetch(path, {
            method: req.method,
            search: req.nextUrl.search,
            body,
            headers: contentType ? { "Content-Type": contentType } : {},
        });
        return { ok: true, response: res };
    } catch (e) {
        const isInvalidPath = e instanceof Error && /^Invalid/.test(e.message);
        const response = isInvalidPath
            ? jsonError(400, "Path tidak valid.")
            : jsonError(504, "Server tidak merespons.");
        return { ok: false, response };
    }
}

async function toClientResponse(backendRes: Response): Promise<Response> {
    if (backendRes.status === 401) {
        await clearToken();
        return jsonError(401, "Sesi berakhir.");
    }
    // Jangan bocorkan pesan error internal backend untuk 5xx.
    if (backendRes.status >= 500) return jsonError(502, "Server sedang bermasalah.");

    const headers = new Headers();
    const contentType = backendRes.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const noBody = [204, 205, 304].includes(backendRes.status);
    return new Response(noBody ? null : backendRes.body, { status: backendRes.status, headers });
}

/** Catat mutasi yang BERHASIL, setelah respons dikirim (tidak menambah latency). */
function scheduleAudit(
    req: NextRequest,
    segments: string[],
    body: ArrayBuffer | undefined,
    backendStatus: number,
    token: string,
) {
    if (backendStatus < 200 || backendStatus >= 300) return;

    const event = describeMutation(req.method, segments, body);
    if (!event) return;

    const context = getRequestContext(req.headers);
    after(() => recordAudit({ ...event, ...context, token }));
}

// ---- handler: hanya mengatur urutan langkah ----

async function handler(req: NextRequest, { params }: Ctx) {
    const { path: segments } = await params;

    const denied = checkAccess(req, segments);
    if (denied) return denied;

    const token = await getToken();
    if (!token) return jsonError(401, "Belum login.");

    const bodyResult = await readBody(req);
    if (!bodyResult.ok) return bodyResult.response;

    const forwardResult = await forwardToBackend(req, toBackendPath(segments), bodyResult.body);
    if (!forwardResult.ok) return forwardResult.response;

    scheduleAudit(req, segments, bodyResult.body, forwardResult.response.status, token);
    return toClientResponse(forwardResult.response);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };