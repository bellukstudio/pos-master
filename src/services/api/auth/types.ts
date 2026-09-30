
export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    phone_number: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "superadmin" | "manager" | "cashier" | "admin" | "supervisor" | string;
    status: "active" | "inactive" | string;
    branch: Branch | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface LoginUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResult {
    token: string;
    refreshToken: string;
    user: LoginUser;
}