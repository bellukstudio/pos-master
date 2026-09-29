
import { Button } from "@/components/tailgrids/core/button";
import { Pagination } from "@/components/tailgrids/core/pagination";

interface PaginationControlsProps {
    page: number;
    totalPages: number | undefined;
    hasNext: boolean;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, hasNext, onPageChange }: Readonly<PaginationControlsProps>) {
    // Backend mengirim total_pages: pakai nomor halaman.
    if (totalPages) {
        if (totalPages <= 1) return null;
        return <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />;
    }

    // Fallback tanpa total_pages: cukup Sebelumnya / Berikutnya.
    if (page === 1 && !hasNext) return null;

    return (
        <div className="flex items-center justify-between">
            <Button
                appearance="outline"
                size="sm"
                isDisabled={page === 1}
                onPress={() => onPageChange(Math.max(1, page - 1))}
            >
                Sebelumnya
            </Button>
            <span className="text-sm text-text-tertiary">Halaman {page}</span>
            <Button
                appearance="outline"
                size="sm"
                isDisabled={!hasNext}
                onPress={() => onPageChange(page + 1)}
            >
                Berikutnya
            </Button>
        </div>
    );
}
