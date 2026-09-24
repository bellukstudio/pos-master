import "server-only";

import { z } from "zod";

const schema = z.object({
    API_BASE_URL: z.url().transform((v) => v.replace(/\/+$/, "")),
    SESSION_COOKIE_NAME: z.string().min(1).default('pm_token'),
    API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000)
});


export const env = schema.parse(process.env);