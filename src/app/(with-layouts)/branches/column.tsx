

import { DataTableColumn } from "@/components/common/data-table";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Branch } from "@/services/api/branch";

export function buildColumns(
    onEdit: (branch: Branch) => void,
    onDelete: (branch: Branch) => void,
): DataTableColumn<Branch>[] {
    return [
        {
            header: "Nama",
            cell: (b) => <span className="font-medium text-text-primary">{b.name}</span>,
            accessorFn: (b) => b.name,
        },
        { header: "Kota", cell: (b) => b.city, accessorFn: (b) => b.city },
        { header: "Provinsi", cell: (b) => b.province, accessorFn: (b) => b.province },
        { header: "Telepon", cell: (b) => b.phone_number },
        {
            header: "Status",
            cell: (b) => (
                <Badge color={b.status ? "success" : "gray"} className="px-2.5">
                    {b.status ? "Aktif" : "Nonaktif"}
                </Badge>
            ),
            accessorFn: (b) => b.status,
        },
        {
            header: "Opsi",
            cell: (b) => (
                <div className="flex gap-2">
                    <Button appearance="outline" size="sm" onPress={() => onEdit(b)}>
                        Ubah
                    </Button>
                    <Button appearance="outline" variant="danger" size="sm" onPress={() => onDelete(b)}>
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];
}

