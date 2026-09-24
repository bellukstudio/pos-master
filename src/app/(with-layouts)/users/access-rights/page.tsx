import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { buttonStyles } from "@/components/tailgrids/core/button-styles";
import PageHeader from "@/components/common/page-header";
import Link from "next/link";

const modules = [
  "Kasir",
  "Produk & Kategori",
  "Pembelian",
  "Stok (Mutasi & Retur)",
  "Member & Loyalty",
  "Promo & Diskon",
  "Laporan",
  "Pengguna",
  "Pengaturan",
];

const roles = ["Admin", "Manajer", "Kasir"] as const;

// Default access matrix — Admin has full access, Manajer most, Kasir minimal.
const defaultAccess: Record<(typeof roles)[number], boolean[]> = {
  Admin: modules.map(() => true),
  Manajer: [true, true, true, true, true, true, true, false, false],
  Kasir: [true, false, false, false, true, false, false, false, false],
};

export default function AccessRightsPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Hak Akses"
        description="Atur modul apa saja yang dapat diakses oleh setiap peran pengguna."
        action={
          <Link href="/users" className={buttonStyles({ variant: "primary", appearance: "outline", size: "md" })}>
            Lihat Pengguna
          </Link>
        }
      />
      <div className="px-2 lg:px-5">
        <Card className="overflow-x-auto p-0">
          <CardContent className="min-w-max p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background-gray-secondary_alt">
                  <th className="px-6 py-3 text-xs font-semibold text-text-secondary">Modul</th>
                  {roles.map((role) => (
                    <th key={role} className="px-6 py-3 text-xs font-semibold text-text-secondary">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, idx) => (
                  <tr key={mod} className="border-t border-card-border">
                    <td className="px-6 py-3 text-sm font-medium text-text-primary">{mod}</td>
                    {roles.map((role) => (
                      <td key={role} className="px-6 py-3">
                        <Checkbox defaultSelected={defaultAccess[role][idx]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
