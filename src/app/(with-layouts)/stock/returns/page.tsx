import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import Link from "next/link";

interface ReturnItem {
  id: string;
  code: string;
  product: string;
  branch: string;
  qty: number;
  reason: string;
  date: string;
  status: "Disetujui" | "Menunggu" | "Ditolak";
}

const returns: ReturnItem[] = [
  { id: "1", code: "RTN-0021", product: "Sabun Lifebuoy", branch: "Cabang Bintaro", qty: 6, reason: "Kemasan rusak", date: "09 Sep 2026", status: "Disetujui" },
  { id: "2", code: "RTN-0022", product: "Teh Botol Sosro", branch: "Cabang Kemang", qty: 3, reason: "Mendekati kadaluarsa", date: "14 Sep 2026", status: "Menunggu" },
  { id: "3", code: "RTN-0023", product: "Kopi Kapal Api Sachet", branch: "Cabang Bintaro", qty: 10, reason: "Salah kirim dari supplier", date: "19 Sep 2026", status: "Ditolak" },
];

const statusColor: Record<ReturnItem["status"], "success" | "warning" | "error"> = {
  Disetujui: "success",
  Menunggu: "warning",
  Ditolak: "error",
};

const columns: DataTableColumn<ReturnItem>[] = [
  { header: "No. Retur", cell: (r) => <span className="font-medium text-text-primary">{r.code}</span> },
  { header: "Produk", cell: (r) => r.product },
  { header: "Cabang", cell: (r) => r.branch },
  { header: "Qty", cell: (r) => r.qty },
  { header: "Alasan", cell: (r) => r.reason },
  { header: "Tanggal", cell: (r) => r.date },
  {
    header: "Status",
    cell: (r) => (
      <Badge color={statusColor[r.status]} className="px-2.5">
        {r.status}
      </Badge>
    ),
  },
];

export default function StockReturnsPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Retur Barang"
        description="Kelola pengajuan retur barang rusak atau salah kirim."
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/stock/mutations" className={buttonStyles({ variant: "primary", appearance: "outline", size: "md" })}>
              Mutasi Stok
            </Link>
            <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
              + Ajukan Retur
            </button>
          </div>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={returns} />
      </div>
    </div>
  );
}
