"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Show stale data immediately while revalidating in background
        staleTime: 30_000, // 30s — no immediate refetch on every navigation
        // On error, show stale data rather than full blank / loader
        placeholderData: (prev: unknown) => prev,
        // Only retry once; if the server is down, fail fast
        retry: 1,
        retryDelay: 1500,
        // Never hang forever — treat a request taking > 15s as failed
        gcTime: 5 * 60_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
