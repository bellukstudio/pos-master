import "server-only";
import { env } from "@/lib/env";
import { buildBackendUrl } from "./backend";
import { getJwtClaims } from "./jwt";
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
    create: "Created",
    update: "Updated",
    delete: "Deleted",
};

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
): AuditEvent | null {
    const action = ACTION_BY_METHOD[method];
    const module = segments[1]; // segments[0] = "admin"
    if (!action || !module) return null;

    const last = segments[segments.length - 1];
    const entityId = UUID_RE.test(last) ? last : undefined;
    const name = readEntityName(body);

    let subject = "";
    if (name) subject = `: ${name}`;
    else if (entityId) subject = ` ${entityId}`;

    return { module, action, description: `${VERB_BY_ACTION[action]} ${module}${subject}` };
}

export function getRequestContext(headers: Headers) {
    const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return {
        ip: forwarded || headers.get("x-real-ip") || "unknown",
        userAgent: (headers.get("user-agent") ?? "unknown").slice(0, 255),
    };
}


const BRANCH_TTL_MS = 5 * 60_000;
const branchCache = new Map<string, { branchId: string | null; expiresAt: number }>();

async function getBranchId(token: string, userId: string): Promise<string | null> {
    const cached = branchCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.branchId;

    try {
        const res = await fetch(buildBackendUrl(BACKEND_PATHS.me), {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
        });
        if (!res.ok) return null;

        const body = (await res.json()) as { data?: { branch?: { id?: string } | null } };
        const branchId = body.data?.branch?.id ?? null;
        branchCache.set(userId, { branchId, expiresAt: Date.now() + BRANCH_TTL_MS });
        return branchId;
    } catch {
        return null;
    }
}

export interface RecordAuditInput extends AuditEvent {
    token: string;
    ip: string;
    userAgent: string;
}

/** Tidak pernah melempar error: kegagalan audit tidak boleh mengganggu aksi utama user. */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
    try {
        const userId = getJwtClaims(input.token)?.id;
        if (!userId) return;

        const branchId = await getBranchId(input.token, userId);

        const res = await fetch(buildBackendUrl(AUDIT_PATH), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${input.token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                user: { id: userId },
                ...(branchId ? { branch: { id: branchId } } : {}),
                module: input.module,
                action: input.action,
                description: input.description,
                ip_address: input.ip,
                device_info: input.userAgent,
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
        });

        if (!res.ok && process.env.NODE_ENV !== "production") {
            console.error(`[audit] backend returned ${res.status}`, await res.text().catch(() => ""));
        }
    } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("[audit] failed:", e);
    }
}