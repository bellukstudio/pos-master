import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import formatCurrency from "@/utils/format-currency";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  branch: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  unit: string;
  status: "Aktif" | "Nonaktif";
}

const products: Product[] = [
  { id: "1", name: "Indomie Goreng", sku: "SKU-00231", category: "Sembako", branch: "Cabang Kemang", buyPrice: 2800, sellPrice: 3500, stock: 240, unit: "pcs", status: "Aktif" },
  { id: "2", name: "Aqua Botol 600ml", sku: "SKU-00114", category: "Minuman", branch: "Cabang Kemang", buyPrice: 2500, sellPrice: 4000, stock: 180, unit: "botol", status: "Aktif" },
  { id: "3", name: "Kopi Kapal Api Sachet", sku: "SKU-00567", category: "Minuman", branch: "Cabang Bintaro", buyPrice: 1200, sellPrice: 2000, stock: 12, unit: "sachet", status: "Aktif" },
  { id: "4", name: "Sabun Mandi Lifebuoy", sku: "SKU-00892", category: "Kebersihan", branch: "Cabang Bintaro", buyPrice: 3200, sellPrice: 4500, stock: 0, unit: "batang", status: "Nonaktif" },
  { id: "5", name: "Beras Premium 5kg", sku: "SKU-00341", category: "Sembako", branch: "Cabang Kemang", buyPrice: 62000, sellPrice: 72000, stock: 34, unit: "karung", status: "Aktif" },
  { id: "6", name: "Buku Tulis 38 Lembar", sku: "SKU-00778", category: "ATK", branch: "Cabang Bintaro", buyPrice: 2000, sellPrice: 3000, stock: 96, unit: "pcs", status: "Aktif" },
  { id: "7", name: "Teh Botol Sosro", sku: "SKU-00459", category: "Minuman", branch: "Cabang Kemang", buyPrice: 3500, sellPrice: 5000, stock: 8, unit: "botol", status: "Aktif" },
  { id: "8", name: "Minyak Goreng 2L", sku: "SKU-00622", category: "Sembako", branch: "Cabang Bintaro", buyPrice: 28000, sellPrice: 34000, stock: 51, unit: "pouch", status: "Aktif" },
];

const columns: DataTableColumn<Product>[] = [
  {
    header: "Produk",
    cell: (p) => (
      <div>
        <p className="font-medium text-text-primary">{p.name}</p>
        <p className="text-xs text-text-tertiary">{p.sku}</p>
      </div>
    ),
  },
  { header: "Kategori", cell: (p) => p.category },
  { header: "Cabang", cell: (p) => p.branch },
  { header: "Harga Beli", cell: (p) => formatCurrency(p.buyPrice) },
  { header: "Harga Jual", cell: (p) => formatCurrency(p.sellPrice) },
  {
    header: "Stok",
    cell: (p) => (
      <span className={p.stock === 0 ? "font-semibold text-red-600" : p.stock < 15 ? "font-semibold text-amber-600" : ""}>
        {p.stock} {p.unit}
      </span>
    ),
  },
  {
    header: "Status",
    cell: (p) => (
      <Badge color={p.status === "Aktif" ? "success" : "gray"} className="px-2.5">
        {p.status}
      </Badge>
    ),
  },
  {
    header: "Aksi",
    cell: () => (
      <button className="cursor-pointer text-sm font-medium text-neutral-brand-color">Edit</button>
    ),
  },
];

export default function ProductsPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Produk"
        description="Kelola daftar produk, harga, dan stok di seluruh cabang."
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/products/categories" className={buttonStyles({ variant: "primary", appearance: "outline", size: "md" })}>
              Kelola Kategori
            </Link>
            <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
              + Tambah Produk
            </button>
          </div>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={products} />
      </div>
    </div>
  );
}
