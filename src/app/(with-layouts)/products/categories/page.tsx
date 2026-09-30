"use client"

import { ReactNode, useMemo, useState } from "react";
import { CategoryProduct, CategoryProductInput } from '@/services/api/categor-product';
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCategoryProducts, useDeleteCategoryProduct, useSaveCategoryProduct } from "@/hooks/api/use-category-product";
import { buildColumns} from "./column";
import { toast } from "sonner";
import { toUserMessage } from "@/lib/api/errors";
import DataTable from "@/components/common/data-table";
import { PaginationControls } from "@/components/common/pagination";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/tailgrids/core/button";
import { TextField } from "@/components/tailgrids/core/text-field";
import { Label } from "@/components/tailgrids/core/label";
import { Input } from "@/components/tailgrids/core/input";
import { CatgoryProductFormDialog, DeleteCategoryProductDialog } from "./dialog";
import { ErrorCard, TableSkeleton } from "@/components/common/skeleton";

const PER_PAGE = 10;

export default function CategoryProductPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [formTarget, setFormTarget] = useState<CategoryProduct | null | undefined>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryProduct | null>(null);

  const search = useDebouncedValue(searchInput.trim());
  const filter = useMemo(() => ({ page, per_page: PER_PAGE, search: search || undefined }), [page, search]);


  const { data, isPending, isError, error, refetch, isFetching } = useCategoryProducts(filter);
  const saveMutation = useSaveCategoryProduct();
  const deleteMutation = useDeleteCategoryProduct();

  const items = data?.items ?? [];
  const totalPages = data?.meta.total_pages;
  const hasNext = totalPages ? page < totalPages : items.length === PER_PAGE;
  const hasFilter = Boolean(search);

  const columns = useMemo(() => buildColumns(setFormTarget, setDeleteTarget), []);
  function handleSave(input: CategoryProductInput) {
    saveMutation.mutate(
      { id: formTarget?.id, input },
      {
        onSuccess: () => {
          toast.success(formTarget ? "Kategori produk diperbarui" : "Kategori produk ditambahkan");
          setFormTarget(null);
        },
        onError: (err) => toast.error(toUserMessage(err))
      }
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Kategori produk dihapus");
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(toUserMessage(err))
    });
  }

  let content: ReactNode;
  if (isPending) {
    content = <TableSkeleton />;
  } else if (isError) {
    content = <ErrorCard error={error} onRetry={() => refetch()} />
  } else {
    content = (
      <>
        <DataTable columns={columns} data={items} emptyLabel={hasFilter ? "Tidak ada kategori produk yang cocok dengan pencarian" : "Belum ada kategori produk"} />
        <PaginationControls page={page} totalPages={totalPages} hasNext={hasNext} onPageChange={setPage} />
      </>
    );
  }


  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Kategori Produk"
        description="Kelola informasi seluruh kategori produk Anda."
        action={
          <Button variant="primary" appearance="fill" size="md" onPress={() => setFormTarget(undefined)}> + Tambah Kategori Produk</Button>
        } />

      <div className="space-y-4 px-2 lg:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField
            className="w-full gap-1.5 sm:max-w-xs"
            value={searchInput}
            onChange={(v) => {
              setSearchInput(v);
              setPage(1);
            }}
          >
            <Label className="text-sm font-medium text-input-label-text">Cari</Label>
            <Input placeholder="Kategori" className="w-full px-3 py-2.5 text-sm" />
          </TextField>
          {isFetching && !isPending && <span className="pb-2.5 text-xs text-text-tertiary">Memuat...</span>}
        </div>
        {content}

      </div>

      <CatgoryProductFormDialog
        target={formTarget}
        isPending={saveMutation.isPending}
        onCancel={() => setFormTarget(null)}
        onSubmit={handleSave}
      />

      <DeleteCategoryProductDialog
        target={deleteTarget}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}