"use client";

import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useBranches, useSaveBranch, useDeleteBranch } from "@/hooks/api/use-branch";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toUserMessage } from "@/lib/api/errors";
import { Branch } from "@/services/api/auth";
import { BranchInput } from "@/services/api/branch";
import { useState, useMemo, ReactNode } from "react";

import { toast } from "sonner";
import { buildColumns} from "./column";
import { BranchFormDialog, DeleteBranchDialog } from "./dialog";
import { PaginationControls } from "@/components/common/pagination";
import { ErrorCard, TableSkeleton } from "@/components/common/skeleton";

const PER_PAGE = 10;


// ---------------- Halaman ----------------

export default function BranchesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [formTarget, setFormTarget] = useState<Branch | null | undefined>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const search = useDebouncedValue(searchInput.trim());
  const filter = useMemo(() => ({ page, per_page: PER_PAGE, search: search || undefined }), [page, search]);

  const { data, isPending, isError, error, refetch, isFetching } = useBranches(filter);
  const saveMutation = useSaveBranch();
  const deleteMutation = useDeleteBranch();

  const items = data?.items ?? [];
  const totalPages = data?.meta.total_pages;
  const hasNext = totalPages ? page < totalPages : items.length === PER_PAGE;
  const hasFilter = Boolean(search);

  const columns = useMemo(() => buildColumns(setFormTarget, setDeleteTarget), []);

  function handleSave(input: BranchInput) {
    saveMutation.mutate(
      { id: formTarget?.id, input },
      {
        onSuccess: () => {
          toast.success(formTarget ? "Cabang diperbarui." : "Cabang ditambahkan.");
          setFormTarget(null);
        },
        onError: (err) => toast.error(toUserMessage(err)),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Cabang dihapus.");
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(toUserMessage(err)),
    });
  }

  let content: ReactNode;
  if (isPending) {
    content = <TableSkeleton />;
  } else if (isError) {
    content = <ErrorCard error={error} onRetry={() => refetch()} />;
  } else {
    content = (
      <>
        <DataTable
          columns={columns}
          data={items}
          emptyLabel={hasFilter ? "Tidak ada cabang yang cocok dengan pencarian." : "Belum ada cabang."}
        />
        <PaginationControls page={page} totalPages={totalPages} hasNext={hasNext} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Cabang"
        description="Kelola informasi seluruh cabang toko Anda."
        action={
          <Button variant="primary" appearance="fill" size="md" onPress={() => setFormTarget(undefined)}>
            + Tambah Cabang
          </Button>
        }
      />

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
            <Input placeholder="Nama, kota, atau provinsi" className="w-full px-3 py-2.5 text-sm" />
          </TextField>

          {isFetching && !isPending && <span className="pb-2.5 text-xs text-text-tertiary">Memuat...</span>}
        </div>

        {content}
      </div>

      <BranchFormDialog
        target={formTarget}
        isPending={saveMutation.isPending}
        onCancel={() => setFormTarget(null)}
        onSubmit={handleSave}
      />
      <DeleteBranchDialog
        target={deleteTarget}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}