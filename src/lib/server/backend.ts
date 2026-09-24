import "server-only";
import { env } from "@/lib/env";
import { getToken } from "./sessions";


const BACKEND_ORIGIN = new URL(env.API_BASE_URL).origin;

export function buildBackendUrl(path: string, search = ""): URL {
    if (!path.startsWith("/")) path = `/${path}`;
    if (path.includes("..") || path.includes("//") || path.includes("\\")) {
        throw new Error("Invalid path");
    }
    const url = new URL(`${env.API_BASE_URL}${path}${search}`);
    if (url.origin !== BACKEND_ORIGIN) throw new Error("Invalid target");
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