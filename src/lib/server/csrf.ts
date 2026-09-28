import "server-only";


export function isTrustedMutation(req: Request): boolean {
    if (req.headers.get("x-requested-with") !== "fetch") return false;

    // Browser selalu mengirim Origin pada request non-GET (fetch/XHR/form),
    // jadi ketiadaannya dianggap tidak tepercaya.
    const origin = req.headers.get("origin");
    if (!origin) return false;

    // Bila browser mengirim Sec-Fetch-Site, hanya same-origin yang diterima.
    const fetchSite = req.headers.get("sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin") return false;

    // x-forwarded-host HANYA boleh dipercaya jika reverse proxy Anda selalu menimpanya.
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!host) return false;

    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

export const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);