"use client";

import { qk } from "@/lib/api/query-keys";
import { productApi } from "@/services/api/product";
import { FilterParams } from "@/types/types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductInput, productInputSchema } from '../../services/api/product/validation';

export function useProducts(filter: FilterParams) {
    return useQuery({
        queryKey: qk.products.list(filter),
        queryFn: ({ signal }) => productApi.list(filter, signal),
        placeholderData: keepPreviousData,
        refetchOnMount: "always"
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: qk.products.detail(id),
        queryFn: ({ signal }) => productApi.get(id, signal),
        enabled: !!id
    });
}

export function useSaveProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id?: string; input: ProductInput }) => {
            const parsed = productInputSchema.parse(input);
            return id ? productApi.update(id, parsed) : productApi.create(parsed);
        },
        onSuccess: async (_data, { id }) => {
            await qc.invalidateQueries({ queryKey: qk.products.all });
            if (id) await qc.invalidateQueries({ queryKey: qk.products.detail(id) });
        }
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productApi.remove(id),
        onSuccess: () => qc.invalidateQueries({
            queryKey: qk.products.all
        })
    });
}