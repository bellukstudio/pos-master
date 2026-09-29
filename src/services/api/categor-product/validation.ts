import z from "zod";


export const categoryProductInputSchema = z.object({
    name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(200),
    description: z.string().trim().min(1, 'Deskripsi wajib diisi').max(255)
});

export type CategoryProductInput = z.infer<typeof categoryProductInputSchema>;

export type CategoryProductFieldErrors = Partial<Record<keyof CategoryProductInput, string>>;

export function toFieldErrors(error: z.ZodError<CategoryProductInput>): CategoryProductFieldErrors {
    const out: CategoryProductFieldErrors = {};
    for (const issue of error.issues) {
        const key = issue.path[0] as keyof CategoryProductInput | undefined;
        if (key && !out[key]) out[key] = issue.message;
    }
    return out;
}