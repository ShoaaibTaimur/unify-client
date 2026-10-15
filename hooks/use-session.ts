"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { User, UseSessionReturn } from "@/types";
import { authClient, AUTH_EVENT } from "@/lib/auth/client";


export function useSession(initialUser?: User | null): UseSessionReturn {
  const [user, setUser] = useState<User | null>(
    initialUser !== undefined ? initialUser : authClient.getCachedUser()
  );
  const [isPending, setIsPending] = useState(
    initialUser === undefined && !authClient.getCachedUser()
  );
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedInitialRef = useRef(false);

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
    // If we have no cached or initial user, verify session on mount
    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
      if (!initialUser && !authClient.getCachedUser()) {
        refetch();
      } else {
        setIsPending(false);
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
  }, [initialUser, refetch]);

  return {
    user,
    isPending,
    isAuthenticated: Boolean(user),
    error,
    refetch,
  };
}
