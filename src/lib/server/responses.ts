import "server-only";

export function jsonError(status: number, message: string, code?: string, headers?: HeadersInit) {
    return Response.json({ message, code }, { status, headers });
}
