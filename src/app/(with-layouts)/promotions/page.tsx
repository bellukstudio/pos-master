import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";

interface Promotion {
  id: string;
  name: string;
  type: "Diskon %" | "Diskon Nominal" | "Beli 1 Gratis 1";
  value: string;
  period: string;
  status: "Aktif" | "Berakhir" | "Terjadwal";
}

const promotions: Promotion[] = [
  { id: "1", name: "Promo Akhir Bulan", type: "Diskon %", value: "10%", period: "25 - 30 Sep 2026", status: "Aktif" },
  { id: "2", name: "Diskon Member Gold", type: "Diskon %", value: "5%", period: "Sepanjang tahun", status: "Aktif" },
  { id: "3", name: "Beli 2 Aqua Gratis 1", type: "Beli 1 Gratis 1", value: "1 gratis", period: "1 - 15 Sep 2026", status: "Berakhir" },
  { id: "4", name: "Diskon Belanja Rp50.000", type: "Diskon Nominal", value: "Rp 50.000", period: "1 - 31 Okt 2026", status: "Terjadwal" },
];

const statusColor: Record<Promotion["status"], "success" | "gray" | "warning"> = {
  Aktif: "success",
  Berakhir: "gray",
  Terjadwal: "warning",
};

const columns: DataTableColumn<Promotion>[] = [
  { header: "Nama Promo", cell: (p) => <span className="font-medium text-text-primary">{p.name}</span> },
  { header: "Tipe", cell: (p) => p.type },
  { header: "Nilai", cell: (p) => p.value },
  { header: "Periode", cell: (p) => p.period },
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
    cell: () => <button className="cursor-pointer text-sm font-medium text-neutral-brand-color">Edit</button>,
  },
];

export default function PromotionsPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Promo & Diskon"
        description="Atur program diskon dan promosi untuk mendorong penjualan."
        action={
          <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
            + Buat Promo
          </button>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={promotions} />
      </div>
    </div>
  );
}
