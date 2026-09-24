import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import formatCurrency from "@/utils/format-currency";

interface Shift {
  id: string;
  cashier: string;
  branch: string;
  start: string;
  end: string | null;
  openingBalance: number;
  closingBalance: number | null;
  status: "Berjalan" | "Selesai";
}

const shifts: Shift[] = [
  { id: "1", cashier: "Yuni Kartika", branch: "Cabang Kemang", start: "24 Sep 2026, 08:00", end: null, openingBalance: 500000, closingBalance: null, status: "Berjalan" },
  { id: "2", cashier: "Fajar Nugroho", branch: "Cabang Bintaro", start: "24 Sep 2026, 08:00", end: null, openingBalance: 500000, closingBalance: null, status: "Berjalan" },
  { id: "3", cashier: "Yuni Kartika", branch: "Cabang Kemang", start: "23 Sep 2026, 08:00", end: "23 Sep 2026, 17:00", openingBalance: 500000, closingBalance: 4230000, status: "Selesai" },
  { id: "4", cashier: "Dedi Kurniawan", branch: "Cabang Bintaro", start: "23 Sep 2026, 08:00", end: "23 Sep 2026, 17:00", openingBalance: 500000, closingBalance: 3810000, status: "Selesai" },
];

const columns: DataTableColumn<Shift>[] = [
  { header: "Kasir", cell: (s) => <span className="font-medium text-text-primary">{s.cashier}</span> },
  { header: "Cabang", cell: (s) => s.branch },
  { header: "Mulai", cell: (s) => s.start },
  { header: "Selesai", cell: (s) => s.end ?? "-" },
  { header: "Saldo Awal", cell: (s) => formatCurrency(s.openingBalance) },
  { header: "Saldo Akhir", cell: (s) => (s.closingBalance ? formatCurrency(s.closingBalance) : "-") },
  {
    header: "Status",
    cell: (s) => (
      <Badge color={s.status === "Berjalan" ? "warning" : "success"} className="px-2.5">
        {s.status}
      </Badge>
    ),
  },
];

export default function ShiftsPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Shift Kasir"
        description="Riwayat buka dan tutup shift kasir di setiap cabang."
        action={
          <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
            + Buka Shift
          </button>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={shifts} />
      </div>
    </div>
  );
}