import { Badge } from "@/components/tailgrids/core/badge";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  level: "Info" | "Peringatan";
}

const entries: AuditEntry[] = [
  { id: "1", user: "Admin Utama", action: "Mengubah harga jual produk 'Beras Premium 5kg'", module: "Produk", timestamp: "24 Sep 2026, 09:12", level: "Info" },
  { id: "2", user: "Yuni Kartika", action: "Membuka shift kasir di Cabang Kemang", module: "Shift", timestamp: "24 Sep 2026, 08:00", level: "Info" },
  { id: "3", user: "Rudi Hartono", action: "Menyetujui retur barang RTN-0021", module: "Stok", timestamp: "23 Sep 2026, 16:40", level: "Info" },
  { id: "4", user: "Lina Marlina", action: "Percobaan login gagal 3 kali", module: "Autentikasi", timestamp: "23 Sep 2026, 07:55", level: "Peringatan" },
  { id: "5", user: "Admin Utama", action: "Menghapus akun pengguna 'Dedi Kurniawan'", module: "Pengguna", timestamp: "22 Sep 2026, 14:20", level: "Peringatan" },
];

const columns: DataTableColumn<AuditEntry>[] = [
  { header: "Pengguna", cell: (e) => <span className="font-medium text-text-primary">{e.user}</span> },
  { header: "Aktivitas", cell: (e) => e.action },
  { header: "Modul", cell: (e) => e.module },
  { header: "Waktu", cell: (e) => e.timestamp },
  {
    header: "Level",
    cell: (e) => (
      <Badge color={e.level === "Info" ? "gray" : "warning"} className="px-2.5">
        {e.level}
      </Badge>
    ),
  },
];

export default function AuditLogPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader title="Log Aktivitas" description="Riwayat aktivitas penting yang dilakukan pengguna di sistem." />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={entries} />
      </div>
    </div>
  );
}
