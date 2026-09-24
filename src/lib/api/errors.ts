export class ApiError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly details?: unknown;

    constructor(
        status: number,
        message: string,
        options?: { code?: string; details?: unknown }
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = options?.code;
        this.details = options?.details;
    }

    get isUnauthorized() {
        return this.status === 401;
    }

    get isForbidden() {
        return this.status === 403;
    }

    get isNotFound() {
        return this.status === 404;
    }


    get isNetwork() {
        return this.status === 0;
    }

    get isServer() {
        return this.status >= 500;
    }
}

export function isApiError(e: unknown): e is ApiError {
    return e instanceof ApiError;
}


export function toUserMessage(e: unknown): string {
    if (!isApiError(e)) return "Terjadi kesalahan. Silakan coba lagi.";
    if (e.isNetwork) return "Tidak dapat terhubung ke server. Periksa koneksi Anda.";
    if (e.isUnauthorized) return "Sesi berakhir. Silakan login kembali.";
    if (e.isForbidden) return "Anda tidak memiliki akses untuk aksi ini.";
    if (e.isServer) return "Server sedang bermasalah. Coba beberapa saat lagi.";
    if (e.isNotFound) return "Data tidak ditemukan.";
    return e.message || "Permintaan tidak dapat diproses.";
}