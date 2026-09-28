import "server-only";



export interface JwtClaims {
    id?: string;
    email?: string;
    role?: string;
    exp?: number;
}

export function getJwtClaims(token: string): JwtClaims | undefined {
    try {
        const payload = token.split(".")[1];
        if (!payload) return undefined;
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtClaims;
    } catch {
        return undefined;
    }
}

export function getJwtExpirySeconds(token: string): number | undefined {
    const exp = getJwtClaims(token)?.exp;
    if (!exp) return undefined;
    const secondsLeft = exp - Math.floor(Date.now() / 1000);
    return secondsLeft > 0 ? secondsLeft : undefined;
}
