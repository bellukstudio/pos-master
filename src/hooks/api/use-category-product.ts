"use client"

import { qk } from "@/lib/api/query-keys";
import { categoryProductApi } from "@/services/api/categor-product";
import { FilterParams } from "@/types/types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryProductInput, categoryProductInputSchema } from '../../services/api/categor-product/validation';

export function useCategoryProducts(filter: FilterParams) {
    return useQuery({
        queryKey: qk.categoryProducts.list(filter),
        queryFn: ({ signal }) => categoryProductApi.list(filter, signal),
        placeholderData: keepPreviousData,
        refetchOnMount: "always",
    });
}

export function useCategoryProduct(id: string) {
    return useQuery({
        queryKey: qk.categoryProducts.detail(id),
        queryFn: ({ signal }) => categoryProductApi.get(id, signal),
        enabled: !!id
    });
}

export function useSaveCategoryProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id?: string; input: CategoryProductInput }) => {
            const parsed = categoryProductInputSchema.parse(input);
            return id ? categoryProductApi.update(id, parsed) : categoryProductApi.create(parsed);
        },
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: qk.categoryProducts.all });
            if (id) qc.invalidateQueries({ queryKey: qk.categoryProducts.detail(id) });
        }
    });
}


export function useDeleteCategoryProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoryProductApi.remove(id),
        onSuccess: () => qc.invalidateQueries({
            queryKey: qk.categoryProducts.all
        })
    });
}