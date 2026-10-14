"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@/types";
import { authClient, AUTH_EVENT } from "@/lib/auth/client";

export interface UseSessionReturn {
  user: User | null;
  isPending: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSession(initialUser?: User | null): UseSessionReturn {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isPending, setIsPending] = useState(initialUser === undefined);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      setUser(session.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setUser(null);
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    const handleAuthChange = () => {
      refetch();
    };

    window.addEventListener(AUTH_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_EVENT, handleAuthChange);
  }, [refetch]);

  return {
    user,
    isPending,
    isAuthenticated: Boolean(user),
    error,
    refetch,
  };
}
