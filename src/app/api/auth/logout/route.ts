import { backendFetch } from "@/lib/server/backend";
import { BACKEND_PATHS } from "@/lib/server/backend_paths";
import { isTrustedMutation } from "@/lib/server/csrf";
import { jsonError } from "@/lib/server/responses";
import { clearRefreshToken, clearToken } from "@/lib/server/sessions";

export async function POST(req: Request) {
    if (!isTrustedMutation(req)) return jsonError(403, "Permintaan tidak valid.");

    await backendFetch(BACKEND_PATHS.logout, { method: "POST" }).catch(() => null);
    await clearToken();
    await clearRefreshToken();

    return new Response(null, { status: 204 });
}