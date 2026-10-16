"use client";

import { useCallback, useEffect, useRef } from "react";
import { dataApi } from "@/lib/store/api-slice";
import {
  initializeSession,
  loginSession,
  logoutSession,
  sessionEnded,
} from "@/lib/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import type { UseAuthReturn } from "@/types";
import { authClient, AUTH_EVENT } from "./client";

export { authClient, AUTH_EVENT };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const lastVerifiedAt = useAppSelector((state) => state.auth.lastVerifiedAt);
  const previousUserId = useRef<string | null>(userId);

  useEffect(() => {
    void dispatch(initializeSession());

    return authClient.subscribe((event) => {
      if (event.type === "signed-out") {
        dispatch(sessionEnded());
        return;
      }
      void dispatch(initializeSession());
    });
  }, [dispatch]);

  useEffect(() => {
    const previous = previousUserId.current;
    if (previous && previous !== userId) dispatch(dataApi.util.resetApiState());
    previousUserId.current = userId;
  }, [dispatch, userId]);

  useEffect(() => {
    const verifyOnFocus = () => {
      const verificationExpired =
        !lastVerifiedAt || Date.now() - lastVerifiedAt > 5 * 60_000;
      if (document.visibilityState === "visible" && verificationExpired) {
        void dispatch(initializeSession());
      }
    };
    document.addEventListener("visibilitychange", verifyOnFocus);
    return () => document.removeEventListener("visibilitychange", verifyOnFocus);
  }, [dispatch, lastVerifiedAt]);

  return children;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      return dispatch(loginSession({ email, password })).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutSession()).unwrap();
  }, [dispatch]);

  const changePassword = useCallback(
    async (current: string, next: string) => {
      await authClient.changePassword(current, next);
      dispatch(sessionEnded());
    },
    [dispatch]
  );

  const refetch = useCallback(async () => {
    await dispatch(initializeSession()).unwrap();
  }, [dispatch]);

  return {
    user: auth.user,
    status: auth.status,
    isAuthenticated: auth.status === "authenticated",
    loaded: auth.status !== "idle" && auth.status !== "checking",
    isPending: auth.status === "idle" || auth.status === "checking",
    isOffline: auth.status === "offline",
    error: auth.error,
    login,
    logout,
    changePassword,
    refetch,
  };
}
