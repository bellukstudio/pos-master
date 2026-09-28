"use client";

import { isApiError } from "@/lib/api/errors";
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

function makeQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: (e) => handleUnauthorized(e, client) }),
    mutationCache: new MutationCache({ onError: (e) => handleUnauthorized(e, client) }),
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