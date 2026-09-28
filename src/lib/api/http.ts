import type { ApiEnvelope, ListResult, PageMeta, QueryParams } from "@/types/api";
import { ApiError } from "./errors";


const BASE = "/api";
const DEFAULT_TIMEOUT_MS = 20_000;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
    params?: QueryParams;
    body?: unknown;
    signal?: AbortSignal;
    timeoutMs?: number;
    headers?: Record<string, string>;
}

function buildUrl(path: string, params?: QueryParams) {
    if (!path.startsWith("/")) path = `/${path}`;
    const qs = new URLSearchParams();
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
        }
    }
    const s = qs.toString();
    return `${BASE}${path}${s ? `?${s}` : ""}`;
}

async function parseBody(res: Response): Promise<unknown> {
    if (res.status === 204) return undefined;
    const text = await res.text();
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function isEnvelope(v: unknown): v is ApiEnvelope<unknown> {
    return typeof v === "object" && v !== null && "meta" in v;
}

interface Sent {
    data: unknown;
    meta?: PageMeta;
}

async function send(method: Method, path: string, opts: RequestOptions = {}): Promise<Sent> {
    const { params, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers } = opts;

    const timeout = AbortSignal.timeout(timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    let res: Response;
    try {
        res = await fetch(buildUrl(path, params), {
            method,
            signal: combined,
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "fetch",
                ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
                ...headers,
            },
            body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
        });
    } catch (err) {
        if (signal?.aborted) throw err;
        throw new ApiError(0, "Gagal terhubung ke server.");
    }

    const parsed = await parseBody(res);
    const envelope = isEnvelope(parsed) ? parsed : undefined;

    if (!res.ok || envelope?.meta.status === "error") {
        // Error dari proxy/route Next berbentuk { message, code }, bukan envelope backend.
        const proxyErr =
            typeof parsed === "object" && parsed !== null && "message" in parsed
                ? (parsed as { message?: string; code?: string })
                : undefined;

        const message =
            envelope?.meta.message || proxyErr?.message || res.statusText || "Request gagal";
        const status = envelope?.meta.code ?? res.status;
        const details =
            envelope && typeof envelope.data === "object" && envelope.data !== null
                ? envelope.data
                : undefined;
        throw new ApiError(status, message, { code: proxyErr?.code, details });
    }

    return { data: envelope ? envelope.data : parsed, meta: envelope?.meta as PageMeta | undefined };
}

async function request<T>(method: Method, path: string, opts?: RequestOptions): Promise<T> {
    return (await send(method, path, opts)).data as T;
}

async function getList<T>(
    path: string,
    opts?: Omit<RequestOptions, "body">,
): Promise<ListResult<T>> {
    const { data, meta } = await send("GET", path, opts);
    return {
        items: Array.isArray(data) ? (data as T[]) : [],
        meta: meta ?? { code: 200, status: "success", message: "" },
    };
}

export const http = {
    get: <T>(path: string, opts?: Omit<RequestOptions, "body">) => request<T>("GET", path, opts),
    getList,
    post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
        request<T>("POST", path, { ...opts, body }),
    put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
        request<T>("PUT", path, { ...opts, body }),
    patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">) =>
        request<T>("PATCH", path, { ...opts, body }),
    delete: <T>(path: string, opts?: Omit<RequestOptions, "body">) => request<T>("DELETE", path, opts),
};