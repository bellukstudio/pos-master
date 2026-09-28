"use client";

import DataTable, { type DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useAuditLogs, useDeleteAuditLog } from "@/hooks/api/use-audit-logs";
import { useMe } from "@/hooks/api/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toUserMessage } from "@/lib/api/errors";
import type { AuditLog } from "@/services/api/audit-log";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

const PER_PAGE = 10;

// Zona waktu dikunci agar tampilan konsisten di semua perangkat.
const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormat.format(date);
}

type BadgeColor = "gray" | "success" | "blue" | "error";

const ACTION_COLORS: Record<string, BadgeColor> = {
  create: "success",
  update: "blue",
  delete: "error",
};

const baseColumns: DataTableColumn<AuditLog>[] = [
  { header: "Waktu", cell: (l) => formatDateTime(l.activity_time) },
  {
    header: "Pengguna",
    cell: (l) => (
      <div className="flex flex-col">
        <span className="font-medium text-text-primary">{l.user?.name ?? "-"}</span>
        {l.user?.role && <span className="text-xs text-text-tertiary capitalize">{l.user.role}</span>}
      </div>
    ),
  },
  { header: "Modul", cell: (l) => <span className="capitalize">{l.module}</span> },
  {
    header: "Aksi",
    cell: (l) => (
      <Badge color={ACTION_COLORS[l.action.toLowerCase()] ?? "gray"} className="px-2.5 capitalize">
        {l.action}
      </Badge>
    ),
  },
  {
    header: "Aktivitas",
    cell: (l) => (
      <span className="block max-w-md truncate" title={l.description}>
        {l.description}
      </span>
    ),
  },
  { header: "Cabang", cell: (l) => l.branch?.name ?? "-" },
  { header: "IP", cell: (l) => l.ip_address ?? "-" },
];

function buildColumns(onDelete: ((log: AuditLog) => void) | undefined): DataTableColumn<AuditLog>[] {
  if (!onDelete) return baseColumns;

  return [
    ...baseColumns,
    {
      header: "Opsi",
      cell: (l) => (
        <Button appearance="outline" variant="danger" size="sm" onPress={() => onDelete(l)}>
          Hapus
        </Button>
      ),
    },
  ];
}

function TableSkeleton() {
  return (
    <Card className="space-y-3 p-5">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </Card>
  );
}

function ErrorCard({ error, onRetry }: Readonly<{ error: unknown; onRetry: () => void }>) {
  return (
    <Card className="flex flex-col items-start gap-3 p-5">
      <p className="text-sm text-text-primary">{toUserMessage(error)}</p>
      <Button appearance="outline" size="sm" onPress={onRetry}>
        Coba lagi
      </Button>
    </Card>
  );
}

interface DeleteDialogProps {
  target: AuditLog | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteAuditDialog({ target, isPending, onCancel, onConfirm }: Readonly<DeleteDialogProps>) {
  return (
    <OverlayWrapper
      isOpen={target !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <Backdrop isDismissable>
        <Dialog className="max-w-108.75 p-0">
          <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
            <DialogTitle className="text-xl leading-7">Hapus log aktivitas?</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              Log ini akan dihapus dari daftar. Penghapusan ini juga dicatat di log aktivitas.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="px-5 py-4">
            <p className="text-sm wrap-break-word text-text-primary">{target?.description}</p>
          </DialogBody>

          <DialogFooter className="px-5 pb-5">
            <Button appearance="outline" isDisabled={isPending} onPress={onCancel}>
              Batal
            </Button>
            <Button variant="danger" isDisabled={isPending} onPress={onConfirm}>
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </Dialog>
      </Backdrop>
    </OverlayWrapper>
  );
}

interface PaginationControlsProps {
  page: number;
  totalPages: number | undefined;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

function PaginationControls({ page, totalPages, hasNext, onPageChange }: Readonly<PaginationControlsProps>) {
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