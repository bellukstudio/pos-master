import "server-only";


export function isTrustedMutation(req: Request): boolean {
    if (req.headers.get("x-requested-with") !== "fetch") return false;

    const origin = req.headers.get("origin");
    if (origin) {
        const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
        try {
            if (new URL(origin).host !== host) return false;
        } catch {
            return false;
        }
    }
    return true;
}

export const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);