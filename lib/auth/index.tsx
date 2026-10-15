"use client";

import React, { createContext, useContext, useCallback } from "react";
import type { User, CreateUserInput, AuthContextValue } from "@/types";
import { authClient, AUTH_EVENT } from "./client";
import { useSession } from "@/hooks/use-session";
import { api } from "../api";

export { authClient, AUTH_EVENT };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const session = useSession(initialUser);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authClient.signIn({ email: email.trim(), password });
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const createUser = useCallback(async (input: CreateUserInput) => {
    return api.createUser(input);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    await api.changePassword(current, next);
  }, []);

  const value: AuthContextValue = {
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    loaded: !session.isPending,
    isPending: session.isPending,
    login,
    logout,
    createUser,
    changePassword,
    refetch: session.refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
