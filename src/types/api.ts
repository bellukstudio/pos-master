export interface ApiErrorBody {
    message?: string;
    code?: string;
    errors?: Record<string, string[]>;
}

export interface Paginated<T> {
    data: T[];
    meta: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;