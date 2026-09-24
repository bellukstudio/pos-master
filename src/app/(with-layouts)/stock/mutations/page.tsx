import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import Link from "next/link";

interface Mutation {
  id: string;
  code: string;
  product: string;
  from: string;
  to: string;
  qty: number;
  date: string;
  status: "Selesai" | "Diproses";
}

const mutations: Mutation[] = [
  { id: "1", code: "MUT-0091", product: "Indomie Goreng", from: "Gudang Pusat", to: "Cabang Kemang", qty: 100, date: "10 Sep 2026", status: "Selesai" },
  { id: "2", code: "MUT-0092", product: "Aqua Botol 600ml", from: "Cabang Kemang", to: "Cabang Bintaro", qty: 40, date: "12 Sep 2026", status: "Selesai" },
  { id: "3", code: "MUT-0093", product: "Beras Premium 5kg", from: "Gudang Pusat", to: "Cabang Bintaro", qty: 20, date: "15 Sep 2026", status: "Diproses" },
  { id: "4", code: "MUT-0094", product: "Minyak Goreng 2L", from: "Gudang Pusat", to: "Cabang Kemang", qty: 30, date: "20 Sep 2026", status: "Diproses" },
];

const columns: DataTableColumn<Mutation>[] = [
  { header: "No. Mutasi", cell: (m) => <span className="font-medium text-text-primary">{m.code}</span> },
  { header: "Produk", cell: (m) => m.product },
  { header: "Dari", cell: (m) => m.from },
  { header: "Ke", cell: (m) => m.to },
  { header: "Qty", cell: (m) => m.qty },
  { header: "Tanggal", cell: (m) => m.date },
  {
    header: "Status",
    cell: (m) => (
      <Badge color={m.status === "Selesai" ? "success" : "warning"} className="px-2.5">
        {m.status}
      </Badge>
    ),
  },
];

export default function StockMutationPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Mutasi Stok"
        description="Perpindahan stok antar gudang dan cabang."
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/stock/returns" className={buttonStyles({ variant: "primary", appearance: "outline", size: "md" })}>
              Retur Barang
            </Link>
            <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
              + Buat Mutasi
            </button>
          </div>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={mutations} />
      </div>
    </div>
  );
}
