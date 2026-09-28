"use client";

import { qk } from "@/lib/api/query-keys";
import { getMe, login, logout } from "@/services/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Data user yang sedang login. */
export function useMe() {
    return useQuery({
        queryKey: qk.auth.me,
        queryFn: getMe,
        staleTime: 5 * 60_000,
        retry: false,
    });
}

export function useLogin() {
    return useMutation({ mutationFn: login });
}

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSettled: () => {
            qc.clear(); // buang seluruh cache milik user sebelumnya
            window.location.assign("/login");
        },
    });
}