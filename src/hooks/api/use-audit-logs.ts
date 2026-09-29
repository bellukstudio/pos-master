"use client";

import { qk } from "@/lib/api/query-keys";
import { AuditLogFilter, deleteAuditLog, getAuditLog, getAuditLogs } from "@/services/api/audit-log";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuditLogs(filter: AuditLogFilter) {
    return useQuery({
        queryKey: qk.auditLogs.list(filter),
        queryFn: ({ signal }) => getAuditLogs(filter, signal),
        placeholderData: keepPreviousData,
        refetchOnMount: "always",
    });
}

export function useAuditLog(id: string | undefined) {
    return useQuery({
        queryKey: qk.auditLogs.detail(id ?? ''),
        queryFn: ({ signal }) => getAuditLog(id!, signal),
        enabled: !!id,
    });
}

export function useDeleteAuditLog() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteAuditLog,
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.auditLogs.all })
    });
}