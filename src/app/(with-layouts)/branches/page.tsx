"use client";

import DataTable, { type DataTableColumn } from "@/components/common/data-table";
import PageHeader from "@/components/common/page-header";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TextField } from "@/components/tailgrids/core/text-field";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { useBranches, useSaveBranch, useDeleteBranch } from "@/hooks/api/use-branch";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toUserMessage } from "@/lib/api/errors";
import { Branch } from "@/services/api/auth";
import { BranchInput } from "@/services/api/branch";
import { BranchFieldErrors, branchInputSchema, toFieldErrors } from "@/services/api/branch/validation";
import { useState, useMemo, ReactNode } from "react";

import { toast } from "sonner";

const PER_PAGE = 10;

const EMPTY_INPUT: BranchInput = {
  name: "",
  address: "",
  city: "",
  province: "",
  phone_number: "",
  status: true,
};

function toInput(branch: Branch): BranchInput {
  const { name, address, city, province, phone_number, status } = branch;
  return { name, address, city, province, phone_number, status };
}

// ---------------- Tabel ----------------

function buildColumns(
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

function TableSkeleton() {
  return (
    <Card className="space-y-3 p-5">
      {Array.from({ length: 5 }, (_, i) => (
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

interface PaginationControlsProps {
  page: number;
  totalPages: number | undefined;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

function PaginationControls({ page, totalPages, hasNext, onPageChange }: Readonly<PaginationControlsProps>) {
  if (totalPages) {
    if (totalPages <= 1) return null;
    return <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />;
  }

  if (page === 1 && !hasNext) return null;

  return (
    <div className="flex items-center justify-between">
      <Button appearance="outline" size="sm" isDisabled={page === 1} onPress={() => onPageChange(Math.max(1, page - 1))}>
        Sebelumnya
      </Button>
      <span className="text-sm text-text-tertiary">Halaman {page}</span>
      <Button appearance="outline" size="sm" isDisabled={!hasNext} onPress={() => onPageChange(page + 1)}>
        Berikutnya
      </Button>
    </div>
  );
}

// ---------------- Dialog tambah/ubah ----------------

interface BranchFormDialogProps {
  // null = tertutup, undefined = mode tambah, Branch = mode ubah.
  target: Branch | null | undefined;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (input: BranchInput) => void;
}

function BranchFormDialog({ target, isPending, onCancel, onSubmit }: Readonly<BranchFormDialogProps>) {
  const isOpen = target !== null;
  const isEdit = Boolean(target);

  const [values, setValues] = useState<BranchInput>(EMPTY_INPUT);
  const [errors, setErrors] = useState<BranchFieldErrors>({});
  // Isi ulang form setiap dialog dibuka untuk target yang berbeda.
  const [openedFor, setOpenedFor] = useState<Branch | null | undefined>(null);

  if (isOpen && target !== openedFor) {
    setOpenedFor(target);
    setValues(target ? toInput(target) : EMPTY_INPUT);
    setErrors({});
  }

  function set<K extends keyof BranchInput>(key: K, value: BranchInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const parsed = branchInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    onSubmit(parsed.data);
  };

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Backdrop isDismissable={!isPending}>
        <Dialog className="max-w-137.5 p-0">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-card-border py-4 pr-14 pl-5">
              <DialogTitle className="text-xl leading-7">
                {isEdit ? "Ubah Cabang" : "Tambah Cabang"}
              </DialogTitle>
            </DialogHeader>

            <DialogBody className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
              <TextField className="gap-1.5 sm:col-span-2" invalid={!!errors.name} required value={values.name} onChange={(v) => set("name", v)}>
                <Label className="text-sm font-medium text-input-label-text">Nama Cabang</Label>
                <Input
                  placeholder="mis. Cabang Jakarta Pusat"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <FieldError>{errors.name}</FieldError>
              </TextField>

              <TextField className="gap-1.5 sm:col-span-2" invalid={!!errors.address} required value={values.address} onChange={(v) => set("address", v)}>
                <Label className="text-sm font-medium text-input-label-text">Alamat</Label>
                <Input
                  placeholder="mis. Jl. Sudirman No. 123"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <FieldError>{errors.address}</FieldError>
              </TextField>

              <TextField className="gap-1.5" invalid={!!errors.city} required value={values.city} onChange={(v) => set("city", v)}>
                <Label className="text-sm font-medium text-input-label-text">Kota</Label>
                <Input
                  placeholder="mis. Jakarta"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <FieldError>{errors.city}</FieldError>
              </TextField>

              <TextField className="gap-1.5" invalid={!!errors.province} required value={values.province} onChange={(v) => set("province", v)}>
                <Label className="text-sm font-medium text-input-label-text">Provinsi</Label>
                <Input
                  placeholder="mis. DKI Jakarta"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <FieldError>{errors.province}</FieldError>
              </TextField>

              <TextField className="gap-1.5" invalid={!!errors.phone_number} required value={values.phone_number} onChange={(v) => set("phone_number", v)}>
                <Label className="text-sm font-medium text-input-label-text">Nomor Telepon</Label>
                <Input
                  placeholder="mis. 021-12345678"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <FieldError>{errors.phone_number}</FieldError>
              </TextField>

              <div className="flex flex-col justify-center gap-1.5">
                <span className="text-sm font-medium text-input-label-text">Status</span>
                <Toggle
                  checked={values.status}
                  onChange={(e) => set("status", e.target.checked)}
                  label={values.status ? "Aktif" : "Nonaktif"}
                />
              </div>
            </DialogBody>

            <DialogFooter className="px-5 pb-5">
              <Button type="button" appearance="outline" isDisabled={isPending} onPress={onCancel}>
                Batal
              </Button>
              <Button type="submit" variant="primary" isDisabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </Backdrop>
    </OverlayWrapper>
  );
}

// ---------------- Dialog hapus ----------------

interface DeleteDialogProps {
  target: Branch | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteBranchDialog({ target, isPending, onCancel, onConfirm }: Readonly<DeleteDialogProps>) {
  return (
    <OverlayWrapper isOpen={target !== null} onOpenChange={(open) => !open && onCancel()}>
      <Backdrop isDismissable>
        <Dialog className="max-w-108.75 p-0">
          <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
            <DialogTitle className="text-xl leading-7">Hapus cabang?</DialogTitle>
          </DialogHeader>

          <DialogBody className="px-5 py-4">
            <p className="text-sm text-text-primary">
              <span className="font-medium">{target?.name}</span> akan dihapus. Tindakan ini dicatat di
              log aktivitas.
            </p>
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