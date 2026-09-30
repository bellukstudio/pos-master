"use client";

import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useAuditLogs, useDeleteAuditLog } from "@/hooks/api/use-audit-logs";
import { useMe } from "@/hooks/api/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toUserMessage } from "@/lib/api/errors";
import type { AuditLog } from "@/services/api/audit-log";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { buildColumns} from "./column";
import { DeleteAuditDialog } from "./dialog";
import { PaginationControls } from "@/components/common/pagination";
import { ErrorCard, TableSkeleton } from "@/components/common/skeleton";

const PER_PAGE = 10;


export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [moduleInput, setModuleInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AuditLog | null>(null);

  const moduleFilter = useDebouncedValue(moduleInput.trim());
  const actionFilter = useDebouncedValue(actionInput.trim());

  const filter = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      module: moduleFilter || undefined,
      action: actionFilter || undefined,
    }),
    [page, moduleFilter, actionFilter],
  );

  const { data, isPending, isError, error, refetch, isFetching } = useAuditLogs(filter);
  const { data: me } = useMe();
  const deleteMutation = useDeleteAuditLog();

  // Hanya tampilan: backend tetap wajib memeriksa hak akses di endpoint DELETE.
  const canDelete = me?.role === "superadmin";
  const columns = useMemo(
    () => buildColumns(canDelete ? setDeleteTarget : undefined),
    [canDelete],
  );

  const items = data?.items ?? [];
  const totalPages = data?.meta.total_pages;
  // Bila backend tidak mengirim total_pages, halaman berikutnya dianggap ada selama halaman ini penuh.
  const hasNext = totalPages ? page < totalPages : items.length === PER_PAGE;
  const hasFilter = Boolean(moduleFilter || actionFilter);

  const onFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Log aktivitas dihapus.");
        // Menghapus baris terakhir di halaman > 1: mundur satu halaman agar tidak kosong.
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(toUserMessage(err)),
    });
  };

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
          emptyLabel={
            hasFilter ? "Tidak ada log yang cocok dengan filter." : "Belum ada log aktivitas."
          }
        />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          hasNext={hasNext}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <PageHeader
        title="Log Aktivitas"
        description="Riwayat aktivitas penting yang dilakukan pengguna di sistem."
      />

      <div className="space-y-4 px-2 lg:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField
            className="w-full gap-1.5 sm:max-w-xs"
            value={moduleInput}
            onChange={onFilterChange(setModuleInput)}
          >
            <Label className="text-sm font-medium text-input-label-text">Modul</Label>
            <Input placeholder="mis. product" className="w-full px-3 py-2.5 text-sm" />
          </TextField>

          <TextField
            className="w-full gap-1.5 sm:max-w-xs"
            value={actionInput}
            onChange={onFilterChange(setActionInput)}
          >
            <Label className="text-sm font-medium text-input-label-text">Aksi</Label>
            <Input placeholder="mis. create" className="w-full px-3 py-2.5 text-sm" />
          </TextField>

          {isFetching && !isPending && (
            <span className="pb-2.5 text-xs text-text-tertiary">Memuat...</span>
          )}
        </div>

        {content}
      </div>

      <DeleteAuditDialog
        target={deleteTarget}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}