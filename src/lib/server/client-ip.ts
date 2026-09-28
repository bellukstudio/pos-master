import "server-only";
import { env } from "@/lib/env";

/**
 * IP klien dari x-forwarded-for. Entri PALING KIRI bisa diisi/dipalsukan klien,
 * jadi yang dipercaya adalah entri yang ditambahkan proxy Anda sendiri:
 * hitung dari kanan sebanyak TRUSTED_PROXY_HOPS.
 * Mengembalikan "unknown" bila tidak bisa ditentukan (mis. dev tanpa proxy).
 */
export function getClientIp(headers: Headers): string {
    const hops = env.TRUSTED_PROXY_HOPS;
    if (hops === 0) return "unknown";

    const parts = (headers.get("x-forwarded-for") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (parts.length > 0) return parts[Math.max(parts.length - hops, 0)];

    return headers.get("x-real-ip")?.trim() || "unknown";
}