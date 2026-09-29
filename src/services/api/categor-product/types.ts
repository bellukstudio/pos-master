
export interface CategoryProduct {
    name: string;
    description: string;
    updated_at: string;
    id: string;
    deleted_at: string | null;
    created_at: string;
}


export interface CategoryProductInput {
    name: string;
    description: string;
}