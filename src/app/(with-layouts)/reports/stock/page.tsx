import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";

interface StockRow {
  id: string;
  product: string;
  branch: string;
  stockIn: number;
  stockOut: number;
  ending: number;
  status: "Aman" | "Menipis" | "Habis";
}

const stockRows: StockRow[] = [
  { id: "1", product: "Indomie Goreng", branch: "Cabang Kemang", stockIn: 200, stockOut: 160, ending: 240, status: "Aman" },
  { id: "2", product: "Sabun Lifebuoy", branch: "Cabang Bintaro", stockIn: 0, stockOut: 30, ending: 0, status: "Habis" },
  { id: "3", product: "Kopi Kapal Api Sachet", branch: "Cabang Bintaro", stockIn: 50, stockOut: 90, ending: 12, status: "Menipis" },
  { id: "4", product: "Beras Premium 5kg", branch: "Cabang Kemang", stockIn: 40, stockOut: 26, ending: 34, status: "Aman" },
];

const statusColor: Record<StockRow["status"], "success" | "warning" | "error"> = {
  Aman: "success",
  Menipis: "warning",
  Habis: "error",
};

const columns: DataTableColumn<StockRow>[] = [
  { header: "Produk", cell: (s) => <span className="font-medium text-text-primary">{s.product}</span> },
  { header: "Cabang", cell: (s) => s.branch },
  { header: "Stok Masuk", cell: (s) => s.stockIn },
  { header: "Stok Keluar", cell: (s) => s.stockOut },
  { header: "Stok Akhir", cell: (s) => s.ending },
  {
    header: "Status",
    cell: (s) => (
      <Badge color={statusColor[s.status]} className="px-2.5">
        {s.status}
      </Badge>
    ),
  },
];

export default function StockReportPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader title="Laporan Stok" description="Pantau pergerakan dan level stok tiap produk." />
      <div className="grid grid-cols-1 gap-5 px-2 sm:grid-cols-3 lg:px-5">
        <Card>
          <CardHeader className="p-0">
            <span className="text-sm font-medium text-text-tertiary">Produk Stok Aman</span>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            <span className="text-2xl font-semibold text-text-primary">86</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-0">
            <span className="text-sm font-medium text-text-tertiary">Produk Stok Menipis</span>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            <span className="text-2xl font-semibold text-amber-600">7</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-0">
            <span className="text-sm font-medium text-text-tertiary">Produk Stok Habis</span>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            <span className="text-2xl font-semibold text-red-600">3</span>
          </CardContent>
        </Card>
      </div>
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={stockRows} />
      </div>
    </div>
  );
}
