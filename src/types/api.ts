
export interface ApiMeta {
    code: number;
    status: "success" | "error";
    message: string;
}

export interface ApiEnvelope<T> {
    meta: ApiMeta;
    data: T;
}


export interface PageMeta extends ApiMeta {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
}

export interface ListResult<T> {
    items: T[];
    meta: PageMeta;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;