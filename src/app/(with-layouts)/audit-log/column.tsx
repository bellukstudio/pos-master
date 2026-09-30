import { type DataTableColumn } from "@/components/common/data-table";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { toUserMessage } from "@/lib/api/errors";
import { AuditLog } from "@/services/api/audit-log";

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

export const baseColumns: DataTableColumn<AuditLog>[] = [
    {
        header: "Waktu",
        cell: (l) => formatDateTime(l.activity_time),
        // String ISO 8601 urut secara leksikografis sama seperti urut waktunya, jadi aman dipakai langsung.
        accessorFn: (l) => l.activity_time,
    },
    {
        header: "Pengguna",
        cell: (l) => (
            <div className="flex flex-col">
                <span className="font-medium text-text-primary">{l.user?.name ?? "-"}</span>
                {l.user?.role && <span className="text-xs text-text-tertiary capitalize">{l.user.role}</span>}
            </div>
        ),
        accessorFn: (l) => l.user?.name,
    },
    {
        header: "Modul",
        cell: (l) => <span className="capitalize">{l.module}</span>,
        accessorFn: (l) => l.module,
    },
    {
        header: "Aksi",
        cell: (l) => (
            <Badge color={ACTION_COLORS[l.action.toLowerCase()] ?? "gray"} className="px-2.5 capitalize">
                {l.action}
            </Badge>
        ),
        accessorFn: (l) => l.action,
    },
    {
        header: "Aktivitas",
        className: "whitespace-normal",
        cell: (l) => (
            <span className="line-clamp-3 max-w-md wrap-break-word" title={l.description}>
                {l.description}
            </span>
        ),
    },
    { header: "Cabang", cell: (l) => l.branch?.name ?? "-" },
    { header: "IP", cell: (l) => l.ip_address ?? "-" },
];

export function buildColumns(onDelete: ((log: AuditLog) => void) | undefined): DataTableColumn<AuditLog>[] {
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

