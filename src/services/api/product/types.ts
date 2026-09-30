/**
 * Bentuk relasi ringkas yang dikembalikan backend saat produk dibaca (GET), berbeda dari
 * bentuk saat dikirim (POST/PATCH) yang hanya { id }. Field selain `id`/`name` masih tebakan
 * saya — belum ada contoh respons GET /admin/product dari Anda. Sesuaikan begitu Anda punya
 * contohnya (mis. kalau ternyata backend juga menyertakan `code` di kategori).
 */
export interface ProductCategoryRef {
    id: string;
    name: string;
}

export interface ProductBranchRef {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    image: string | null;
    status: boolean;
    code: string;
    stock: number;
    unit: string;
    barcode: string;
    purchase_price: number;
    sale_price: number;
    category: ProductCategoryRef;
    branch: ProductBranchRef;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}
