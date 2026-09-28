import { QueryParams } from "@/types/api";
import { http } from "./http";


const toParams = (filter?: object) => ({ ...filter }) as QueryParams;

export function createResource<
    T,
    F extends object = QueryParams,
    C = Partial<T>,
    U = Partial<T>,
>(basePath: string) {
    const base = basePath.startsWith("/") ? basePath : `/${basePath}`;
    const itemPath = (id: string) => `${base}/${encodeURIComponent(id)}`;

    return {
        base,
        itemPath,

        /** GET /base?page=1&... -> { items, meta } */
        list: (filter?: F, signal?: AbortSignal) =>
            http.getList<T>(base, { params: toParams(filter), signal }),

        /** GET /base/:id */
        get: (id: string, signal?: AbortSignal) => http.get<T>(itemPath(id), { signal }),

        /** POST /base */
        create: (input: C) => http.post<T>(base, input),

        /** PATCH /base/:id  (ganti ke http.put jika backend Anda memakai PUT) */
        update: (id: string, input: U) => http.put<T>(itemPath(id), input),

        /** DELETE /base/:id */
        remove: (id: string) => http.delete<void>(itemPath(id)),
    };
}