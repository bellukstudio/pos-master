import z from "zod";

const PHONE_RE = /^[0-9+()\- ]{6,20}$/;

export const branchInputSchema = z.object({
    name: z.string().trim().min(1, 'Nama cabang wajib diisi').max(150),
    address: z.string().trim().min(1, 'Alamat wajib diisi').max(255),
    city: z.string().trim().min(1, 'Kota wajib diisi').max(100),
    province: z.string().trim().min(1, 'Provinsi wajib diisi').max(100),
    phone_number: z.string().trim().min(1, 'Nomor telepon wajib diisi').regex(PHONE_RE, 'Format nomor telepon tidak valid'),
    status: z.boolean()
});

export type BranchInput = z.infer<typeof branchInputSchema>;

export const branchFilterSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    per_page: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(100).optional()
});

export type BranchFieldErrors = Partial<Record<keyof BranchInput, string>>;

export function toFieldErrors(error: z.ZodError<BranchInput>): BranchFieldErrors {
    const out: BranchFieldErrors = {};
    for (const issue of error.issues) {
        const key = issue.path[0] as keyof BranchInput | undefined;
        if (key && !out[key]) out[key] = issue.message;
    }
    return out;
}