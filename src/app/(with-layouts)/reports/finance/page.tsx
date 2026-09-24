import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import formatCurrency from "@/utils/format-currency";

interface FinanceRow {
  id: string;
  category: string;
  type: "Pemasukan" | "Pengeluaran";
  amount: number;
  date: string;
}

const rows: FinanceRow[] = [
  { id: "1", category: "Penjualan Toko", type: "Pemasukan", amount: 38610000, date: "Minggu ini" },
  { id: "2", category: "Pembelian Barang dari Supplier", type: "Pengeluaran", amount: 15900000, date: "Minggu ini" },
  { id: "3", category: "Gaji Karyawan", type: "Pengeluaran", amount: 12500000, date: "Minggu ini" },
  { id: "4", category: "Biaya Operasional (listrik, sewa, dll)", type: "Pengeluaran", amount: 3200000, date: "Minggu ini" },
];

const columns: DataTableColumn<FinanceRow>[] = [
  { header: "Kategori", cell: (r) => <span className="font-medium text-text-primary">{r.category}</span> },
  { header: "Tipe", cell: (r) => r.type },
  { header: "Periode", cell: (r) => r.date },
  {
    header: "Jumlah",
    cell: (r) => (
      <span className={r.type === "Pemasukan" ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
        {r.type === "Pemasukan" ? "+" : "-"} {formatCurrency(r.amount)}
      </span>
    ),
  },
];

export default function FinancialReportPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader title="Laporan Keuangan" description="Ringkasan pemasukan dan pengeluaran toko." />
      <div className="grid grid-cols-1 gap-5 px-2 sm:grid-cols-3 lg:px-5">
        <Card>
          <CardHeader className="p-0">
            <span className="text-sm font-medium text-text-tertiary">Total Pemasukan</span>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            <span className="text-2xl font-semibold text-green-600">{formatCurrency(38610000)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-0">
            <span className="text-sm font-medium text-text-tertiary">Total Pengeluaran</span>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            <span className="text-2xl font-semibold text-red-600">{formatCurrency(31600000)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-0">
            <span className="text-sm font-medium text-text-tertiary">Laba Bersih</span>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            <span className="text-2xl font-semibold text-text-primary">{formatCurrency(7010000)}</span>
          </CardContent>
        </Card>
      </div>
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={rows} />
      </div>
    </div>
  );
}
