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
import { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyLabel = "Belum ada data.",
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyLabel?: string;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <TableRoot className="w-full rounded-none border-none">
          <TableHeader>
            <TableRow className="bg-background-gray-secondary_alt">
              {columns.map((col) => (
                <TableHead
                  key={col.header}
                  className="px-6 py-2.5 text-xs leading-4 font-semibold whitespace-nowrap text-text-secondary"
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
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
              data.map((row) => (
                <TableRow key={row.id} className="[&_td]:border-none">
                  {columns.map((col) => (
                    <TableCell
                      key={col.header}
                      className={cn(
                        "h-16 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] whitespace-nowrap text-text-primary",
                        col.className,
                      )}
                    >
                      {col.cell(row)}
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
