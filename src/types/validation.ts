import z from "zod";

export const filterSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    per_page: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(100).optional()
});
