import "server-only";

export function jsonError(status: number, message: string, code?: string) {
    return Response.json({ message, code }, { status });
}