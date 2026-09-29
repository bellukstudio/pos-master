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
    audit: "log aktivitas",
    branch: "cabang",
    category_product: "kategori produk",
    customer: "pelanggan",
    detail_purchase: "detail pembelian",
    loyalty: "loyalitas",
    mutation_stock: "mutasi stok",
    product: "produk",
    promo: "promo",
    purchase_product: "pembelian produk",
    reports: "laporan",
    return_goods: "retur barang",
    settings: "pengaturan",
    shift: "shift",
    supplier: "pemasok",
    transaction: "transaksi",
    transaction_detail: "detail transaksi",
    user: "pengguna",
};

/**
 * Nilai enum module yang diterima backend (AuditLogDto). HARUS sama dengan backend:
 * nilai di luar daftar ini ditolak backend dengan status 400.
 * Diturunkan dari struktur folder module Nest (src/admin/*). "auth" sengaja tidak
 * dimasukkan: login/logout punya route sendiri, bukan lewat proxy [...path].
 *
 * BELUM DIVERIFIKASI ke definisi enum asli di backend selain "product" yang sudah
 * terbukti lewat contoh respons sukses. Cek definisi enum-nya di backend; kalau ada
 * yang beda ejaan (terutama "reports" vs "report" dan "settings" vs "setting"),
 * sesuaikan set dan peta di bawah ini.
 */
const BACKEND_MODULES = new Set([
    "audit",
    "branch",
    "category_product",
    "customer",
    "detail_purchase",
    "loyalty",
    "mutation_stock",
    "product",
    "promo",
    "purchase_product",
    "reports",
    "return_goods",
    "settings",
    "shift",
    "supplier",
    "transaction",
    "transaction_detail",
    "user",
]);

/**
 * Segmen pertama URL (setelah "admin") -> nilai enum backend.
 * Tidak bisa diturunkan otomatis dari nama karena beberapa endpoint memakai
 * ejaan berbeda dari nama modulnya: URL pakai tanda hubung/singular, sedangkan
 * modul (dan kemungkinan besar nilai enum-nya) pakai underscore/plural.
 * Contoh: URL "/admin/return-of-goods" -> modul "return_goods".
 */
const URL_SEGMENT_TO_MODULE: Record<string, string> = {
    audit: "audit",
    branch: "branch",
    "category-product": "category_product",
    customer: "customer",
    "detail-purchase": "detail_purchase",
    loyalty: "loyalty",
    "mutation-stock": "mutation_stock",
    product: "product",
    promo: "promo",
    "purchase-product": "purchase_product",
    report: "reports",
    "return-of-goods": "return_goods",
    setting: "settings",
    shift: "shift",
    supplier: "supplier",
    transaction: "transaction",
    "transaction-detail": "transaction_detail",
    user: "user",
};

function resolveModule(segment: string | undefined): string | null {
    if (!segment) return null;
    const module = URL_SEGMENT_TO_MODULE[segment.toLowerCase()];
    return module && BACKEND_MODULES.has(module) ? module : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuditEvent {
    module: string;
    action: string;
    description: string;
}

/** Baca body JSON sebagai objek biasa. Gagal parse / bukan objek -> undefined. */
function parseJsonObject(body: ArrayBuffer | undefined): Record<string, unknown> | undefined {
    if (!body || body.byteLength === 0) return undefined;
    try {
        const parsed: unknown = JSON.parse(new TextDecoder().decode(body));
        return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : undefined;
    } catch {
        return undefined;
    }
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

// --- Perbandingan data lama vs baru, khusus untuk aksi update ---

/** Field yang tidak pernah ditampilkan di diff: sensitif, atau metadata yang selalu berubah. */
const DIFF_IGNORED_FIELDS = new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "password",
    "password_confirmation",
    "old_password",
    "new_password",
    "token",
    "access_token",
    "refresh_token",
    "secret",
]);

/** Label field dalam Bahasa Indonesia untuk field yang umum lintas modul. */
const FIELD_LABELS: Record<string, string> = {
    name: "nama",
    status: "status",
    address: "alamat",
    city: "kota",
    province: "provinsi",
    phone_number: "nomor telepon",
    email: "email",
    role: "peran",
    price: "harga",
    stock: "stok",
    quantity: "jumlah",
    description: "deskripsi",
    sku: "SKU",
    discount: "diskon",
    category: "kategori",
};

function labelForField(field: string): string {
    return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

/** Boolean pada field bertipe status diterjemahkan; boolean lain jadi Ya/Tidak; objek/array tidak diuraikan. */
function formatFieldValue(field: string, value: unknown): string {
    if (value === null || value === undefined || value === "") return "(kosong)";
    if (typeof value === "boolean") {
        return field === "status" || field.startsWith("is_") ? (value ? "Aktif" : "Nonaktif") : value ? "Ya" : "Tidak";
    }
    if (typeof value === "object") return "(data kompleks)";
    return clean(String(value), 60);
}

/**
 * Bandingkan data SEBELUM (dari backend) dengan body yang dikirim browser.
 * Hanya field yang benar-benar dikirim di body dan nilainya berubah yang dilaporkan,
 * supaya field yang tidak disentuh user tidak ikut muncul di deskripsi.
 */
function diffEntity(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
    const changes: string[] = [];

    for (const [field, newValue] of Object.entries(after)) {
        if (DIFF_IGNORED_FIELDS.has(field)) continue;
        if (typeof newValue === "object" && newValue !== null) continue; // relasi/array: lewati, terlalu rumit untuk satu baris

        const oldValue = before[field];
        if (oldValue === newValue) continue;

        changes.push(
            `${labelForField(field)} dari ${formatFieldValue(field, oldValue)} menjadi ${formatFieldValue(field, newValue)}`,
        );
    }

    return changes;
}

/**
 * Ubah request mutasi menjadi kejadian audit.
 * /admin/product/products/:id (DELETE) -> { module: "product", action: "delete", ... }
 * Mengembalikan null bila tidak perlu dicatat (bukan mutasi).
 * Penghapusan log audit juga dicatat (modul "audit") demi akuntabilitas.
 *
 * beforeEntity: data entitas SEBELUM perubahan (hasil fetchEntitySnapshot), dipakai untuk:
 *  - deskripsi yang punya nama, bukan sekadar UUID (create/update/delete)
 *  - daftar field yang berubah, khusus update (mis. "status dari Aktif menjadi Nonaktif")
 */
export function describeMutation(
    method: string,
    segments: string[],
    body: ArrayBuffer | undefined,
    beforeEntity?: Record<string, unknown>,
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

    const isAuditLog = module === "audit";
    const afterBody = parseJsonObject(body);

    const last = segments[segments.length - 1];
    const entityId = UUID_RE.test(last) ? last : undefined;
    const name =
        labelFromEntity(isAuditLog, beforeEntity) ??
        (typeof afterBody?.name === "string" ? clean(afterBody.name, 100) : undefined);

    let subject = "";
    if (name) subject = `: ${name}`;
    else if (entityId) subject = ` ${entityId}`;

    const moduleLabel = LABEL_BY_MODULE[module] ?? module;
    const verb = VERB_BY_ACTION[action];

    if (action === "update" && beforeEntity && afterBody) {
        const changes = diffEntity(beforeEntity, afterBody);
        if (changes.length > 0) {
            return { module, action, description: `${verb} ${moduleLabel}${subject} (${changes.join("; ")})` };
        }
    }

    return { module, action, description: `${verb} ${moduleLabel}${subject}` };
}

/**
 * Untuk PUT/PATCH/DELETE: baca entitasnya SEBELUM diubah/dihapus, agar deskripsi audit
 * bisa menyebut apa yang berubah (update) atau nama entitasnya (delete), bukan sekadar UUID.
 * Dipanggil di dalam handler (memakai cookie sesi). Gagal/tidak ada -> undefined.
 */
export async function fetchEntitySnapshot(
    method: string,
    segments: string[],
): Promise<Record<string, unknown> | undefined> {
    if (method !== "PUT" && method !== "PATCH" && method !== "DELETE") return undefined;
    if (!UUID_RE.test(segments[segments.length - 1] ?? "")) return undefined;

    try {
        const res = await backendFetch("/" + segments.map(encodeURIComponent).join("/"));
        if (!res.ok) return undefined;
        const body = (await res.json().catch(() => null)) as { data?: Record<string, unknown> } | null;
        return body?.data;
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