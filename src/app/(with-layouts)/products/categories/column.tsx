
import { DataTableColumn } from "@/components/common/data-table";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { toUserMessage } from "@/lib/api/errors";
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


export function TableSkeleton() {
    return (
        <Card>
            {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
        </Card>
    );
}

export function ErrorCard({ error, onRetry }: Readonly<{ error: unknown; onRetry: () => void }>) {
    return (
        <Card className="flex flex-col items-start gap-3 p-5">
            <p className="text-sm text-text-primary">{toUserMessage(error)}</p>
            <Button appearance="outline" size="sm" onPress={onRetry}></Button>
        </Card>
    );
}