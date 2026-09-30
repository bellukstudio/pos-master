
import { DataTableColumn } from "@/components/common/data-table";
import { Button } from "@/components/tailgrids/core/button";
import { CategoryProduct } from "@/services/api/categor-product";



// -----------Table-----------
export function buildColumns(
    onEdit: (categoryProduct: CategoryProduct) => void,
    onDelete: (categoryProduct: CategoryProduct) => void
): DataTableColumn<CategoryProduct>[] {
    return [
        {
            header: "Nama",
            cell: (b) => <span className="font-medium text-text-primary">{b.name}</span>,
            accessorFn: (b) => b.name
        },
        {
            header: "Deskripsi",
            cell: (b) => b.description,
            accessorFn: (b) => b.description
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
            )
        }
    ];
}

