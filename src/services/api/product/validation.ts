import { z } from "zod";

const required = (label: string) => `${label} wajib diisi.`;

const idRef = (label: string) =>
    z.object({ id: z.uuid(`ID ${label} tidak valid.`) });

export const productInputSchema = z.object({
    name: z.string().trim().min(1, required("Nama produk")).max(200, "Nama produk terlalu panjang."),
    description: z
        .string()
        .trim()
        .min(1, required("Deskripsi produk"))
        .max(255, "Deskripsi produk terlalu panjang."),
    image: z.string().trim().nullable().optional(),
    status: z.boolean(),
    code: z.string().trim().min(1, required("Kode produk")).max(100, "Kode produk terlalu panjang."),
    stock: z.number().int("Stok harus bilangan bulat.").min(0, "Stok tidak boleh negatif."),
    unit: z.string().trim().min(1, required("Satuan produk")).max(20, "Satuan produk terlalu panjang."),
    barcode: z.string().trim().min(1, required("Barcode produk")).max(100, "Barcode terlalu panjang."),
    purchase_price: z.number().min(0, "Harga beli tidak boleh negatif."),
    sale_price: z.number().min(0, "Harga jual tidak boleh negatif."),
    category: idRef("kategori"),
    branch: idRef("cabang"),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductFieldErrors = Partial<Record<keyof ProductInput, string>>;

export function toFieldErrors(error: z.ZodError<ProductInput>): ProductFieldErrors {
    const out: ProductFieldErrors = {};
    for (const issue of error.issues) {
        const key = issue.path[0] as keyof ProductInput | undefined;
        if (key && !out[key]) out[key] = issue.message;
    }
    return out;
}