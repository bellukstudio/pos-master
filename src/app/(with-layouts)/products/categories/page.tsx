import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: "Aktif" | "Nonaktif";
}

const categories: Category[] = [
  { id: "1", name: "Sembako", description: "Kebutuhan pokok sehari-hari", productCount: 42, status: "Aktif" },
  { id: "2", name: "Minuman", description: "Minuman dalam kemasan & botol", productCount: 28, status: "Aktif" },
  { id: "3", name: "Kebersihan", description: "Sabun, deterjen, dan perlengkapan mandi", productCount: 19, status: "Aktif" },
  { id: "4", name: "ATK", description: "Alat tulis kantor & sekolah", productCount: 15, status: "Aktif" },
  { id: "5", name: "Elektronik Kecil", description: "Baterai, kabel, dan aksesoris kecil", productCount: 7, status: "Nonaktif" },
];

const columns: DataTableColumn<Category>[] = [
  { header: "Nama Kategori", cell: (c) => <span className="font-medium text-text-primary">{c.name}</span> },
  { header: "Deskripsi", cell: (c) => c.description },
  { header: "Jumlah Produk", cell: (c) => `${c.productCount} produk` },
  {
    header: "Status",
    cell: (c) => (
      <Badge color={c.status === "Aktif" ? "success" : "gray"} className="px-2.5">
        {c.status}
      </Badge>
    ),
  },
  {
    header: "Aksi",
    cell: () => <button className="cursor-pointer text-sm font-medium text-neutral-brand-color">Edit</button>,
  },
];

export default function CategoriesPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Kategori Produk"
        description="Kelompokkan produk agar lebih mudah dicari saat transaksi."
        action={
          <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
            + Tambah Kategori
          </button>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={categories} />
      </div>
    </div>
  );
}
