import "server-only";
import { env } from "@/lib/env";
import { getToken } from "./sessions";


const BACKEND_URL = new URL(env.API_BASE_URL);
const BACKEND_ORIGIN = BACKEND_URL.origin;
const BACKEND_BASE_PATH = BACKEND_URL.pathname.replace(/\/+$/, "");

export function buildBackendUrl(path: string, search = ""): URL {
    if (!path.startsWith("/")) path = `/${path}`;

    // Segmen "." dan ".." dinormalisasi diam-diam oleh `new URL()`,
    // sehingga bisa mengubah path akhir tanpa terdeteksi cek berbasis string.
    const segments = path.split("/").slice(1);
    if (
        path.includes("..") ||
        path.includes("//") ||
        path.includes("\\") ||
        segments.some((s) => s === "." || s === "..")
    ) {
        throw new Error("Invalid path");
    }

    const url = new URL(`${env.API_BASE_URL}${path}${search}`);
    if (url.origin !== BACKEND_ORIGIN) throw new Error("Invalid target");

    // Pertahanan berlapis: path akhir harus persis base + path yang diminta.
    if (url.pathname !== `${BACKEND_BASE_PATH}${path}`) throw new Error("Invalid path");

    return url;
}

export interface BackendFetchOptions extends Omit<RequestInit, "headers"> {
    headers?: Record<string, string>;
    search?: string;
    auth?: boolean;
}

export async function backendFetch(path: string, opts: BackendFetchOptions = {}): Promise<Response> {
    const { headers = {}, search = "", auth = true, ...init } = opts;
    const url = buildBackendUrl(path, search);

    const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers };
    if (auth) {
        const token = await getToken();
        if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
        ...init,
        headers: finalHeaders,
        cache: "no-store",
        signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
    });
}