import { DataTableColumn } from "@/components/common/data-table";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Product } from "@/services/api/product";
import formatCurrency from "@/utils/format-currency";


export function buildColumns(
    onEdit: (product: Product) => void,
    onDelete: (product: Product) => void
): DataTableColumn<Product>[] {
    return [
        {
            header: "Nama",
            cell: (p) => <span className="font-medium text-text-primary">{p.name}</span>,
            accessorFn: (p) => p.name,
        },
        {
            header: "Deskripsi",
            className: "whitespace-normal",
            cell: (p) => (
                <span className="line-clamp-3 max-w-md wrap-break-word" title={p.description}>
                    {p.description}
                </span>
            ),
            accessorFn: (p) => p.description
        },
        {
            header: "Status",
            cell: (p) => (
                <Badge color={p.status ? "success" : "gray"} className="px-2.5">
                    {p.status ? "Aktif" : "Nonaktif"}
                </Badge>
            ),
            accessorFn: (p) => p.status
        },
        {
            header: "Kode Produk",
            cell: (p) => <span className="text-text-primary font-bold">{p.code}</span>,
            accessorFn: (p) => p.code
        },
        {
            header: "Stok",
            cell: (p) => <span className="text-text-primary font-medium">{p.stock}</span>,
            accessorFn: (p) => p.stock,
        },
        {
            header: "Satuan",
            cell: (p) => <span className="text-text-primary font-medium">{p.unit}</span>,
            accessorFn: (p) => p.unit
        },
        {
            header: "Barcode",
            cell: (p) => <span className="text-text-primary font-medium">{p.barcode}</span>,
            accessorFn: (p) => p.barcode
        },
        {
            header: "Harga Beli",
            cell: (p) => <span className="text-text-primary font-medium">{formatCurrency(p.purchase_price)}</span>,
            accessorFn: (p) => p.purchase_price
        },
        {
            header: "Harga Jual",
            cell: (p) => <span className="text-text-primary font-medium">{formatCurrency(p.sale_price)}</span>,
            accessorFn: (p) => p.sale_price,
        },
        {
            header: "Kategori",
            cell: (p) => <span className="text-text-primary font-medium">{p.category.name}</span>,
            accessorFn: (p) => p.category.name
        },
        {
            header: "Cabang",
            cell: (p) => <span className="text-text-primary font-medium">{p.branch.name}</span>,
            accessorFn: (p) => p.branch.name
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