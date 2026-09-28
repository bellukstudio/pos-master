import { http } from '@/lib/api/http';
import { AuditLog, AuditLogFilter } from './types';

export type * from './types';

const BASE = 'admin/audit/audit-logs';

export const getAuditLogs = (filter: AuditLogFilter, signal?: AbortSignal) => http.getList<AuditLog>(BASE, { params: { ...filter }, signal });

export const getAuditLog = (id: string, signal?: AbortSignal) => http.get<AuditLog>(`${BASE}/${encodeURIComponent(id)}`, { signal });

export const deleteAuditLog = (id: string) => http.delete<void>(`${BASE}/${encodeURIComponent(id)}`);