import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import DataTable, { DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import Link from "next/link";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manajer" | "Kasir";
  branch: string;
  status: "Aktif" | "Nonaktif";
}

const users: AppUser[] = [
  { id: "1", name: "Rudi Hartono", email: "rudi@postoko.com", role: "Manajer", branch: "Cabang Kemang", status: "Aktif" },
  { id: "2", name: "Lina Marlina", email: "lina@postoko.com", role: "Manajer", branch: "Cabang Bintaro", status: "Aktif" },
  { id: "3", name: "Yuni Kartika", email: "yuni@postoko.com", role: "Kasir", branch: "Cabang Kemang", status: "Aktif" },
  { id: "4", name: "Fajar Nugroho", email: "fajar@postoko.com", role: "Kasir", branch: "Cabang Bintaro", status: "Aktif" },
  { id: "5", name: "Admin Utama", email: "admin@postoko.com", role: "Admin", branch: "Semua Cabang", status: "Aktif" },
  { id: "6", name: "Dedi Kurniawan", email: "dedi@postoko.com", role: "Kasir", branch: "Cabang Bintaro", status: "Nonaktif" },
];

const columns: DataTableColumn<AppUser>[] = [
  { header: "Nama", cell: (u) => <span className="font-medium text-text-primary">{u.name}</span> },
  { header: "Email", cell: (u) => u.email },
  { header: "Peran", cell: (u) => u.role },
  { header: "Cabang", cell: (u) => u.branch },
  {
    header: "Status",
    cell: (u) => (
      <Badge color={u.status === "Aktif" ? "success" : "gray"} className="px-2.5">
        {u.status}
      </Badge>
    ),
  },
  {
    header: "Aksi",
    cell: () => <button className="cursor-pointer text-sm font-medium text-neutral-brand-color">Edit</button>,
  },
];

export default function UsersPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Pengguna"
        description="Kelola akun staf yang dapat mengakses sistem Pos Master."
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/users/access-rights" className={buttonStyles({ variant: "primary", appearance: "outline", size: "md" })}>
              Hak Akses
            </Link>
            <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
              + Tambah Pengguna
            </button>
          </div>
        }
      />
      <div className="px-2 lg:px-5">
        <DataTable columns={columns} data={users} />
      </div>
    </div>
  );
}
