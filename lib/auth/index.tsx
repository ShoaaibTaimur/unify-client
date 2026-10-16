"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  initializeSession,
  loginSession,
  logoutSession,
  sessionEnded,
} from "@/lib/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import type { CreateUserInput, UseAuthReturn } from "@/types";
import { authClient, AUTH_EVENT } from "./client";

export { authClient, AUTH_EVENT };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
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
    if (previous && previous !== userId) queryClient.clear();
    previousUserId.current = userId;
  }, [queryClient, userId]);

  useEffect(() => {
    const verifyOnFocus = () => {
      if (document.visibilityState === "visible") void dispatch(initializeSession());
    };
    document.addEventListener("visibilitychange", verifyOnFocus);
    return () => document.removeEventListener("visibilitychange", verifyOnFocus);
  }, [dispatch]);

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

  const createUser = useCallback(async (input: CreateUserInput) => {
    return api.createUser(input);
  }, []);

  const changePassword = useCallback(
    async (current: string, next: string) => {
      await api.changePassword(current, next);
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
    createUser,
    changePassword,
    refetch,
  };
}
