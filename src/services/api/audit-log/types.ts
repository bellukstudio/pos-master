import type { Branch } from "@/services/api/auth/types";

export interface AuditLogUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AuditLog {
    id: string;
    module: string;
    action: string;
    description: string;
    activity_time: string;
    ip_address: string | null;
    device_info: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user: AuditLogUser | null;
    branch: Branch | null;
}

export interface AuditLogFilter {
    page?: number;
    per_page?: number;
    module?: string;
    action?: string;
}