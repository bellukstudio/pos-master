import { after, type NextRequest } from "next/server";
import {
    describeMutation,
    getRequestContext,
    lookupEntityLabel,
    recordAudit,
} from "@/lib/server/audit";
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

/**
 * Setiap segmen harus "polos": tidak kosong, bukan "." / "..", tanpa pemisah path
 * atau karakter kontrol. Segmen "." lolos dari cek lama lalu dinormalisasi `new URL()`
 * sehingga bisa menghindari aturan berbasis posisi segmen (mis. blokir log audit).
 */
function hasSafeSegments(segments: string[]): boolean {
    return segments.every(
        (s) => s !== "" && s !== "." && s !== ".." && !/[/\\\u0000-\u001f]/.test(s),
    );
}

function isAllowedPath(segments: string[]): boolean {
    return segments.length > 0 && ALLOWED_ROOTS.has(segments[0]);
}

/**
 * Log audit dari browser hanya boleh DIBACA atau DIHAPUS.
 * Membuat/mengubah entri (POST/PUT/PATCH) diblokir: itu tugas server (lib/server/audit.ts),
 * supaya pelaku, cabang, IP, dan device tidak bisa dipalsukan.
 * Dibandingkan dalam huruf kecil karena backend bisa saja case-insensitive.
 */
const AUDIT_BROWSER_METHODS = new Set(["GET", "HEAD", "OPTIONS", "DELETE"]);

function isForbiddenAuditWrite(segments: string[], method: string): boolean {
    return (
        segments[0] === "admin" &&
        segments[1]?.toLowerCase() === "audit" &&
        !AUDIT_BROWSER_METHODS.has(method)
    );
}

function checkAccess(req: NextRequest, segments: string[]): Response | null {
    if (!hasSafeSegments(segments)) return jsonError(400, "Path tidak valid.");
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

type BodyResult = { ok: true; body: ArrayBuffer | undefined } | { ok: false; response: Response };

const tooLarge = (): BodyResult => ({ ok: false, response: jsonError(413, "Data terlalu besar.") });

/** Baca body sambil dibatasi: berhenti begitu melewati batas, bukan setelah semuanya dimuat. */
async function readBody(req: NextRequest): Promise<BodyResult> {
    if (SAFE_METHODS.has(req.method)) return { ok: true, body: undefined };

    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return tooLarge();

    if (!req.body) return { ok: true, body: undefined };

    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
            await reader.cancel().catch(() => undefined);
            return tooLarge();
        }
        chunks.push(value);
    }

    if (total === 0) return { ok: true, body: undefined };

    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return { ok: true, body: merged.buffer as ArrayBuffer };
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

/**
 * Catat mutasi yang BERHASIL.
 * Umumnya dijalankan setelah respons dikirim (tidak menambah latency). Khusus penghapusan
 * log audit, pencatatan DITUNGGU dulu: bila tidak, UI me-refetch daftar sebelum entrinya
 * sempat ada, dan kegagalan pencatatan tak terlihat oleh siapa pun.
 */
async function recordMutation(
    req: NextRequest,
    segments: string[],
    body: ArrayBuffer | undefined,
    backendStatus: number,
    token: string,
    entityLabel: string | undefined,
) {
    if (backendStatus < 200 || backendStatus >= 300) return;

    const event = describeMutation(req.method, segments, body, entityLabel);
    if (!event) return;

    const input = { ...event, ...getRequestContext(req.headers), token };
    if (segments[1]?.toLowerCase() === "audit") {
        await recordAudit(input);
    } else {
        after(() => recordAudit(input));
    }
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

    // Khusus DELETE: baca dulu label entitas (nama / isi log) sebelum datanya hilang.
    const entityLabel = await lookupEntityLabel(req.method, segments);

    const forwardResult = await forwardToBackend(req, toBackendPath(segments), bodyResult.body);
    if (!forwardResult.ok) return forwardResult.response;

    await recordMutation(
        req,
        segments,
        bodyResult.body,
        forwardResult.response.status,
        token,
        entityLabel,
    );
    return toClientResponse(forwardResult.response);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };