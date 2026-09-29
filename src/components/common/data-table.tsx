"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState, type ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /**
   * Nilai pembanding untuk sorting. Opsional — kolom tanpa ini tetap tampil seperti biasa,
   * hanya tidak bisa diklik untuk diurutkan.
   * Sorting berjalan di CLIENT, jadi hanya mengurutkan baris yang sudah dimuat di halaman
   * saat ini (mis. 10 baris), bukan seluruh data di server.
   */
  accessorFn?: (row: T) => string | number | boolean | null | undefined;
}

/**
 * `ColumnDef<T>` adalah UNION antara kolom ber-accessor (bisa di-sort) dan kolom display
 * (tidak bisa) — key `accessorFn` harus benar-benar TIDAK ADA pada kolom display, jadi dua
 * kasus ini dipisah lewat percabangan, bukan ternary pada satu object literal.
 *
 * `className` sengaja TIDAK dititipkan lewat `meta` tanstack: bentuk generic `ColumnMeta`
 * berbeda-beda antar versi package (butuh declaration merging yang persis sama dengan versi
 * terpasang, gampang meleset). Sebagai gantinya, `DataTable` di bawah membaca `className`
 * langsung dari array `columns` aslinya lewat indeks — lebih sederhana dan tidak tergantung versi.
 */
function toColumnDef<T>(col: DataTableColumn<T>, id: string): ColumnDef<T> {
  const cell = (ctx: CellContext<T, unknown>) => col.cell(ctx.row.original);

  if (col.accessorFn) {
    const accessorFn = col.accessorFn;
    return { id, header: col.header, accessorFn: (row: T) => accessorFn(row), cell };
  }
  return { id, header: col.header, cell };
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyLabel = "Belum ada data.",
}: Readonly<{
  columns: DataTableColumn<T>[];
  data: T[];
  emptyLabel?: string;
}>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Sama-sama dibangun dari `columns` dengan urutan yang sama; dipakai untuk mencocokkan
  // kembali className tiap kolom saat merender header & cell tanpa lewat `meta`.
  const tableColumns = useMemo(
    () => columns.map((col, index) => toColumnDef(col, `${index}-${col.header}`)),
    // biome-ignore lint: cukup dibangun ulang saat jumlah/urutan kolom berubah, bukan tiap render.
    [columns.length],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <TableRoot className="w-full rounded-none border-none">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-background-gray-secondary_alt">
                {headerGroup.headers.map((header) => {
                  const sortState = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="px-6 py-2.5 text-xs leading-4 font-semibold whitespace-nowrap text-text-secondary"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-text-primary"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="flex flex-col text-text-tertiary">
                            {sortState === "asc" && <ArrowUpIcon className="size-3" />}
                            {sortState === "desc" && <ArrowDownIcon className="size-3" />}
                            {!sortState && (
                              <span className="flex flex-col opacity-30">
                                <ArrowUpIcon className="-mb-1 size-3" />
                              </span>
                            )}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 px-6 py-3 text-center text-sm text-text-tertiary"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id} className="[&_td]:border-none">
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "h-16 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] whitespace-nowrap text-text-primary",
                        columns[cellIndex]?.className,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </CardContent>
    </Card>
  );
}