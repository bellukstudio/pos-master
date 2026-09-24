import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import formatCurrency from "@/utils/format-currency";

interface Purchase {
  id: string;
  code: string;
  supplier: string;
  branch: string;
  date: string;
  itemCount: number;
  total: number;
  status: "Diterima" | "Dikirim" | "Menunggu";
}

const purchases: Purchase[] = [
  { id: "1", code: "PO-20260901", supplier: "PT Sumber Makmur", branch: "Cabang Kemang", date: "01 Sep 2026", itemCount: 12, total: 4850000, status: "Diterima" },
  { id: "2", code: "PO-20260904", supplier: "CV Anugerah Distribusi", branch: "Cabang Bintaro", date: "04 Sep 2026", itemCount: 8, total: 2100000, status: "Dikirim" },
  { id: "3", code: "PO-20260908", supplier: "PT Sumber Makmur", branch: "Cabang Kemang", date: "08 Sep 2026", itemCount: 20, total: 7650000, status: "Menunggu" },
  { id: "4", code: "PO-20260912", supplier: "UD Berkat Jaya", branch: "Cabang Bintaro", date: "12 Sep 2026", itemCount: 5, total: 980000, status: "Diterima" },
  { id: "5", code: "PO-20260918", supplier: "CV Anugerah Distribusi", branch: "Cabang Kemang", date: "18 Sep 2026", itemCount: 15, total: 5320000, status: "Diterima" },
];

const statusColor: Record<Purchase["status"], "success" | "warning" | "gray"> = {
  Diterima: "success",
  Dikirim: "warning",
  Menunggu: "gray",
};

const columns: DataTableColumn<Purchase>[] = [
  { header: "No. PO", cell: (p) => <span className="font-medium text-text-primary">{p.code}</span> },
  { header: "Supplier", cell: (p) => p.supplier },
  { header: "Cabang", cell: (p) => p.branch },
  { header: "Tanggal", cell: (p) => p.date },
  { header: "Jumlah Item", cell: (p) => `${p.itemCount} item` },
  { header: "Total", cell: (p) => formatCurrency(p.total) },
  {
    header: "Status",
    cell: (p) => (
      <Badge color={statusColor[p.status]} className="px-2.5">
        {p.status}
      </Badge>
    ),
  },
  {
    header: "Aksi",
    cell: () => <button className="cursor-pointer text-sm font-medium text-neutral-brand-color">Detail</button>,
  },
];

export default function PurchasesPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Pembelian"
        description="Catat dan pantau pembelian barang dari supplier."
        action={
          <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
            + Buat Pembelian
          </button>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={purchases} />
      </div>
    </div>
  );
}
