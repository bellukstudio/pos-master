import { createResource } from '@/lib/api/resource';
import { AuditLog, AuditLogFilter } from './types';

export type * from './types';

const BASE = 'admin/audit/audit-logs';


const auditLogApi = createResource<AuditLog, AuditLogFilter>("admin/audit/audit-logs");

export const getAuditLogs = auditLogApi.list;
export const getAuditLog = auditLogApi.get;
export const deleteAuditLog = auditLogApi.remove;