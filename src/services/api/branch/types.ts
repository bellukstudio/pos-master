export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    phone_number: string;
    status: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface BranchFilter {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface BranchInput {
    name: string
    address: string;
    city: string;
    phone_number: string;
    province: string;
    status: boolean;
}

