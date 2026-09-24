import { Badge } from "@/components/tailgrids/core/badge";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import PageHeader from "@/components/common/page-header";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: "Aktif" | "Nonaktif";
}

const branches: Branch[] = [
  { id: "1", name: "Cabang Kemang", address: "Jl. Kemang Raya No. 12, Jakarta Selatan", phone: "021-7180012", manager: "Rudi Hartono", status: "Aktif" },
  { id: "2", name: "Cabang Bintaro", address: "Jl. Bintaro Utama Sektor 3, Tangerang Selatan", phone: "021-7451190", manager: "Lina Marlina", status: "Aktif" },
  { id: "3", name: "Cabang Depok", address: "Jl. Margonda Raya No. 88, Depok", phone: "021-7773344", manager: "-", status: "Nonaktif" },
];

export default function BranchesPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Cabang"
        description="Kelola informasi seluruh cabang toko Anda."
        action={
          <button className={buttonStyles({ variant: "primary", appearance: "fill", size: "md" })}>
            + Tambah Cabang
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-3 lg:px-5">
        {branches.map((branch) => (
          <Card key={branch.id}>
            <CardContent className="p-0">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-base font-semibold text-text-primary">{branch.name}</h3>
                <Badge color={branch.status === "Aktif" ? "success" : "gray"} className="px-2.5">
                  {branch.status}
                </Badge>
              </div>
              <p className="mb-3 text-sm text-text-tertiary">{branch.address}</p>
              <div className="space-y-1 text-sm text-text-secondary">
                <p>Telepon: {branch.phone}</p>
                <p>Manajer: {branch.manager}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
