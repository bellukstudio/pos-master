import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import { backendFetch, buildBackendUrl } from "./backend";
import { getClientIp } from "./client-ip";
import { BACKEND_PATHS } from "./backend_paths";

/**
 * Pencatatan audit di sisi SERVER.
 * Pelaku (user), cabang, IP, dan device TIDAK PERNAH diambil dari input browser,
 * jadi tidak bisa dipalsukan oleh pengguna.
 */

const AUDIT_PATH = "/admin/audit/audit-logs";

const ACTION_BY_METHOD: Record<string, string> = {
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
};

const VERB_BY_ACTION: Record<string, string> = {
    create: "Menambah",
    update: "Mengubah",
    delete: "Menghapus",
};

/** Nama modul untuk deskripsi. Nilai `module` yang dikirim ke backend tetap enum aslinya. */
const LABEL_BY_MODULE: Record<string, string> = {
    product: "produk",
    sale: "penjualan",
    customer: "pelanggan",
    report: "laporan",
    setting: "pengaturan",
    purchase: "pembelian",
    shift: "shift",
    stock: "stok",
    user: "pengguna",
    supplier: "pemasok",
    program: "program",
    audit: "log aktivitas",
};

/**
 * Nilai enum `module` yang diterima backend (AuditLogDto). HARUS sama dengan backend:
 * nilai di luar daftar ini ditolak backend dengan status 400.
 * "audit" perlu ditambahkan dulu di backend (DTO + kolom enum di database).
 */
const BACKEND_MODULES = new Set([
    "product",
    "sale",
    "customer",
    "report",
    "setting",
    "purchase",
    "shift",
    "stock",
    "user",
    "supplier",
    "program",
    "audit",
]);

/** Segmen URL -> nilai enum backend. Mengenali bentuk jamak ("products" -> "product"). */
function resolveModule(segment: string | undefined): string | null {
    if (!segment) return null;
    const s = segment.toLowerCase();
    return [s, s.replace(/s$/, "")].find((c) => BACKEND_MODULES.has(c)) ?? null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuditEvent {
    module: string;
    action: string;
    description: string;
}

/** Ambil "name" dari body JSON (bila ada) untuk deskripsi. Field lain (mis. password) tidak disentuh. */
function readEntityName(body: ArrayBuffer | undefined): string | undefined {
    if (!body || body.byteLength === 0) return undefined;
    try {
        const parsed = JSON.parse(new TextDecoder().decode(body)) as { name?: unknown };
        return typeof parsed.name === "string" ? parsed.name.slice(0, 100) : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Ubah request mutasi menjadi kejadian audit.
 * /admin/product/products/:id (DELETE) -> { module: "product", action: "delete", ... }
 * Mengembalikan null bila tidak perlu dicatat (bukan mutasi).
 * Penghapusan log audit juga dicatat (modul "audit") demi akuntabilitas.
 */
export function describeMutation(
    method: string,
    segments: string[],
    body: ArrayBuffer | undefined,
    entityLabel?: string,
): AuditEvent | null {
    const action = ACTION_BY_METHOD[method];
    if (!action) return null;

    const module = resolveModule(segments[1]); 
    if (!module) {
        console.warn(
            `[audit] segmen ${JSON.stringify(String(segments[1]).slice(0, 40))} tidak punya padanan modul di backend; aktivitas tidak dicatat`,
        );
        return null;
    }

    const last = segments[segments.length - 1];
    const entityId = UUID_RE.test(last) ? last : undefined;
    const name = readEntityName(body);

    
    let subject = "";
    if (name) subject = `: ${name}`;
    else if (entityLabel) subject = `: ${entityLabel}`;
    else if (entityId) subject = ` ${entityId}`;

    const label = LABEL_BY_MODULE[module] ?? module;
    return { module, action, description: `${VERB_BY_ACTION[action]} ${label}${subject}` };
}

const clean = (v: string, max: number) => v.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

/** Label yang mudah dibaca dari data entitas backend. */
function labelFromEntity(isAuditLog: boolean, data: Record<string, unknown> | undefined) {
    if (!data) return undefined;

    if (isAuditLog) {
        
        if (typeof data.description !== "string" || !data.description) return undefined;
        const who = (data.user as { name?: unknown } | null | undefined)?.name;
        const by = typeof who === "string" && who ? ` (oleh ${clean(who, 50)})` : "";
        return `"${clean(data.description, 100)}"${by}`;
    }

    for (const key of ["name", "title", "email", "sku"]) {
        const v = data[key];
        if (typeof v === "string" && v) return clean(v, 100);
    }
    return undefined;
}

/**
 * Untuk DELETE: baca entitasnya SEBELUM dihapus agar deskripsi audit bermakna, bukan sekadar UUID.
 * Dipanggil di dalam handler (memakai cookie sesi). Gagal/tidak ada -> undefined (pakai UUID).
 */
export async function lookupEntityLabel(
    method: string,
    segments: string[],
): Promise<string | undefined> {
    if (method !== "DELETE") return undefined;
    if (!UUID_RE.test(segments[segments.length - 1] ?? "")) return undefined;

    try {
        const res = await backendFetch("/" + segments.map(encodeURIComponent).join("/"));
        if (!res.ok) return undefined;
        const body = (await res.json().catch(() => null)) as {
            data?: Record<string, unknown>;
        } | null;
        return labelFromEntity(segments[1]?.toLowerCase() === "audit", body?.data);
    } catch {
        return undefined;
    }
}

export function getRequestContext(headers: Headers) {
    return {
        ip: getClientIp(headers),
        userAgent: (headers.get("user-agent") ?? "unknown").slice(0, 255),
    };
}


const ACTOR_TTL_MS = 5 * 60_000;
const ACTOR_CACHE_MAX = 1000;

interface Actor {
    userId: string;
    branchId: string | null;
}


const actorCache = new Map<string, Actor & { expiresAt: number }>();
const tokenKey = (token: string) => createHash("sha256").update(token).digest("hex");

/** Kegagalan audit harus terlihat di log server, juga di production (tanpa token/data sensitif). */
function logAuditFailure(reason: string, detail?: unknown) {
    console.error(`[audit] ${reason}`, detail ?? "");
}

/**
 * Pelaku diambil dari /auth/me (diverifikasi backend), bukan dari klaim JWT yang di-decode
 * tanpa verifikasi dan nama klaimnya belum tentu "id".
 */
async function getActor(token: string): Promise<Actor | null> {
    const key = tokenKey(token);
    const cached = actorCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached;

    const res = await fetch(buildBackendUrl(BACKEND_PATHS.me), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
    });
    if (!res.ok) {
        logAuditFailure(`gagal membaca /auth/me (status ${res.status})`);
        return null;
    }

    const body = (await res.json().catch(() => null)) as {
        data?: { id?: string; branch?: { id?: string } | null };
    } | null;
    const userId = body?.data?.id;
    if (!userId) {
        logAuditFailure("respons /auth/me tidak memuat data.id");
        return null;
    }

    const actor: Actor = { userId, branchId: body?.data?.branch?.id ?? null };
    if (actorCache.size >= ACTOR_CACHE_MAX) {
        const oldest = actorCache.keys().next().value;
        if (oldest !== undefined) actorCache.delete(oldest);
    }
    actorCache.set(key, { ...actor, expiresAt: Date.now() + ACTOR_TTL_MS });
    return actor;
}

export interface RecordAuditInput extends AuditEvent {
    token: string;
    ip: string;
    userAgent: string;
}

/** Tidak pernah melempar error: kegagalan audit tidak boleh mengganggu aksi utama user. */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
    try {
        const actor = await getActor(input.token);
        if (!actor) return;

        const res = await fetch(buildBackendUrl(AUDIT_PATH), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${input.token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                user: { id: actor.userId },
                ...(actor.branchId ? { branch: { id: actor.branchId } } : {}),
                module: input.module,
                action: input.action,
                description: input.description,
                ip_address: input.ip,
                device_info: input.userAgent,
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
        });

        if (!res.ok) {
            const text = (await res.text().catch(() => "")).slice(0, 300);
            logAuditFailure(`backend menolak pencatatan (status ${res.status})`, text);
        }
    } catch (e) {
        logAuditFailure("pencatatan gagal", e);
    }
}