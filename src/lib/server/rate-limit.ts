
import "server-only";



interface Entry {
    count: number;
    resetAt: number;
}


const MAX_KEYS = 10_000;



export function createLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
    const store = new Map<string, Entry>();

    function sweep(now: number) {
        for (const [key, entry] of store) if (entry.resetAt <= now) store.delete(key);
    }

    return {
        /** Detik sampai boleh mencoba lagi; 0 bila belum terkunci. */
        retryAfter(key: string): number {
            const entry = store.get(key);
            if (!entry) return 0;
            const now = Date.now();
            if (entry.resetAt <= now) {
                store.delete(key);
                return 0;
            }
            return entry.count >= limit ? Math.ceil((entry.resetAt - now) / 1000) : 0;
        },

        /** Catat satu kegagalan. */
        hit(key: string): void {
            const now = Date.now();
            const entry = store.get(key);
            if (entry && entry.resetAt > now) {
                entry.count += 1;
                return;
            }
            if (store.size >= MAX_KEYS) {
                sweep(now);
                if (store.size >= MAX_KEYS) {
                    const oldest = store.keys().next().value;
                    if (oldest !== undefined) store.delete(oldest);
                }
            }
            store.set(key, { count: 1, resetAt: now + windowMs });
        },

        reset(key: string): void {
            store.delete(key);
        },
    };
}