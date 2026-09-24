import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import formatCurrency from "@/utils/format-currency";

interface Member {
  id: string;
  name: string;
  phone: string;
  tier: "Silver" | "Gold" | "Platinum";
  points: number;
  totalSpend: number;
  joinedAt: string;
}

const members: Member[] = [
  { id: "1", name: "Siti Aminah", phone: "0812-3456-7890", tier: "Gold", points: 1250, totalSpend: 4850000, joinedAt: "Jan 2025" },
  { id: "2", name: "Budi Santoso", phone: "0813-2211-4455", tier: "Platinum", points: 3420, totalSpend: 12300000, joinedAt: "Mar 2024" },
  { id: "3", name: "Rina Wijaya", phone: "0821-9988-1122", tier: "Silver", points: 320, totalSpend: 950000, joinedAt: "Jun 2026" },
  { id: "4", name: "Andi Prasetyo", phone: "0857-1234-5678", tier: "Gold", points: 980, totalSpend: 3600000, joinedAt: "Nov 2025" },
  { id: "5", name: "Dewi Lestari", phone: "0896-4433-2211", tier: "Silver", points: 150, totalSpend: 420000, joinedAt: "Aug 2026" },
];

const tierColor: Record<Member["tier"], "gray" | "warning" | "violet"> = {
  Silver: "gray",
  Gold: "warning",
  Platinum: "violet",
};

const columns: DataTableColumn<Member>[] = [
  { header: "Nama", cell: (m) => <span className="font-medium text-text-primary">{m.name}</span> },
  { header: "No. HP", cell: (m) => m.phone },
  {
    header: "Tier",
    cell: (m) => (
      <Badge color={tierColor[m.tier]} className="px-2.5">
        {m.tier}
      </Badge>
    ),
  },
  { header: "Poin", cell: (m) => `${m.points.toLocaleString("id-ID")} poin` },
  { header: "Total Belanja", cell: (m) => formatCurrency(m.totalSpend) },
  { header: "Bergabung", cell: (m) => m.joinedAt },
  {
    header: "Aksi",
    cell: () => <button className="cursor-pointer text-sm font-medium text-neutral-brand-color">Detail</button>,
  },
];

export default function MembersPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Member & Loyalty"
        description="Kelola data pelanggan dan poin loyalitas mereka."
        action={
          <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
            + Tambah Member
          </button>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={members} />
      </div>
    </div>
  );
}
