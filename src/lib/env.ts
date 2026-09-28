import "server-only";

import { z } from "zod";
import { SESSION_COOKIE_NAME } from "./session-cookie";

const schema = z.object({
    API_BASE_URL: z.url().transform((v) => v.replace(/\/+$/, "")),
    API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),

    TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),
});

export const env = { ...schema.parse(process.env), SESSION_COOKIE_NAME };