import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import formatCurrency from "@/utils/format-currency";

interface DailySales {
  id: string;
  date: string;
  branch: string;
  transactions: number;
  revenue: number;
}

const dailySales: DailySales[] = [
  { id: "1", date: "20 Sep 2026", branch: "Cabang Kemang", transactions: 128, revenue: 8450000 },
  { id: "2", date: "20 Sep 2026", branch: "Cabang Bintaro", transactions: 96, revenue: 6210000 },
  { id: "3", date: "21 Sep 2026", branch: "Cabang Kemang", transactions: 141, revenue: 9120000 },
  { id: "4", date: "21 Sep 2026", branch: "Cabang Bintaro", transactions: 103, revenue: 6870000 },
  { id: "5", date: "22 Sep 2026", branch: "Cabang Kemang", transactions: 119, revenue: 7960000 },
];

const summary = [
  { label: "Total Penjualan (7 hari)", value: formatCurrency(38610000) },
  { label: "Total Transaksi", value: "587" },
  { label: "Rata-rata / Transaksi", value: formatCurrency(65800) },
];

const columns: DataTableColumn<DailySales>[] = [
  { header: "Tanggal", cell: (d) => d.date },
  { header: "Cabang", cell: (d) => d.branch },
  { header: "Jumlah Transaksi", cell: (d) => d.transactions },
  { header: "Pendapatan", cell: (d) => <span className="font-medium">{formatCurrency(d.revenue)}</span> },
];

export default function SalesReportPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader title="Laporan Penjualan" description="Ringkasan performa penjualan per cabang." />
      <div className="grid grid-cols-1 gap-5 px-2 sm:grid-cols-3 lg:px-5">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader className="p-0">
              <span className="text-sm font-medium text-text-tertiary">{item.label}</span>
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <span className="text-2xl font-semibold text-text-primary">{item.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={dailySales} />
      </div>
    </div>
  );
}
