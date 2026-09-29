"use client";

import { isApiError } from "@/lib/api/errors";
import { qk } from "@/lib/api/query-keys";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

let redirecting = false;

function handleUnauthorized(error: unknown, client: QueryClient) {
  if (!isApiError(error) || !error.isUnauthorized) return;
  if (typeof window === "undefined" || redirecting) return;
  if (window.location.pathname.startsWith("/login")) return;

  redirecting = true;
  client.clear(); // buang data user lama dari cache
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?next=${next}`);
}

/**
 * Server mencatat audit log otomatis untuk hampir SEMUA mutation (lihat lib/server/audit.ts),
 * jadi dari sisi klien kita tidak bisa menebak mutation mana saja yang menghasilkan entri baru.
 * Aturan paling aman: setiap mutation yang SUKSES menandai cache Log Aktivitas basi, supaya
 * jika halaman itu sedang terbuka ia langsung refetch, dan jika belum, ia fetch fresh saat dibuka.
 * Mutation di modul audit sendiri (mis. hapus log) sudah invalidate qk.auditLogs.all sendiri;
 * dipanggil dua kali di sini tidak masalah (invalidateQueries aman dipanggil berulang).
 */
function markAuditLogsStale(client: QueryClient) {
  client.invalidateQueries({ queryKey: qk.auditLogs.all });
}

function makeQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: (e) => handleUnauthorized(e, client) }),
    mutationCache: new MutationCache({
      onError: (e) => handleUnauthorized(e, client),
      onSuccess: () => markAuditLogsStale(client),
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Jangan retry kesalahan klien (4xx) kecuali timeout/rate-limit.
          if (isApiError(error) && error.status >= 400 && error.status < 500) {
            return [408, 429].includes(error.status) && failureCount < 2;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
  return client;
}

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}