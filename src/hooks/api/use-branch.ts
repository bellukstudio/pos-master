"use client";

import { qk } from "@/lib/api/query-keys";
import { branchApi, BranchFilter } from "@/services/api/branch";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BranchInput, branchInputSchema } from '../../services/api/branch/validation';


export function useBranches(filter: BranchFilter) {
    return useQuery({
        queryKey: qk.branches.list(filter),
        queryFn: ({ signal }) => branchApi.list(filter, signal),
        placeholderData: keepPreviousData
    });
}


export function useBranch(id: string) {
    return useQuery({
        queryKey: qk.branches.detail(id),
        queryFn: ({ signal }) => branchApi.get(id, signal),
        enabled: !!id,
    });
}


export function useSaveBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id?: string; input: BranchInput }) => {
            const parsed = branchInputSchema.parse(input);
            return id ? branchApi.update(id, parsed) : branchApi.create(parsed);
        },
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: qk.branches.all });
            if (id) qc.invalidateQueries({ queryKey: qk.branches.detail(id) });
        }
    });
}


export function useDeleteBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => branchApi.remove(id),
        onSuccess: () => qc.invalidateQueries({
            queryKey: qk.branches.all
        })
    });
}