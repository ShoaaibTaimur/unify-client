"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { User, UseSessionReturn } from "@/types";
import { authClient, AUTH_EVENT } from "@/lib/auth/client";


export function useSession(initialUser?: User | null): UseSessionReturn {
  const cachedUser = authClient.getCachedUser();
  const effectiveUser = initialUser || cachedUser || null;

  const [user, setUser] = useState<User | null>(effectiveUser);
  const [isPending, setIsPending] = useState<boolean>(!effectiveUser);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedInitialRef = useRef(false);

  const refetch = useCallback(async (): Promise<void> => {
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
    if (initialUser) {
      setUser(initialUser);
      setIsPending(false);
    }
  }, [initialUser]);

  useEffect(() => {
    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
      if (!user) {
        setIsPending(true);
        refetch();
      } else {
        // Silently verify in background
        refetch();
      }
    }

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: User | null }>;
      if (customEvent.detail && "user" in customEvent.detail) {
        setUser(customEvent.detail.user);
        setIsPending(false);
      } else {
        refetch();
      }
    };

    window.addEventListener(AUTH_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_EVENT, handleAuthChange);
  }, [user, refetch]);

  return {
    user,
    isPending,
    isAuthenticated: Boolean(user),
    error,
    refetch,
  };
}
