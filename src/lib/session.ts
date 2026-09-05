"use client";

import { useEffect, useState } from "react";
import type { ClassSelection, User } from "./types";

const CLASS_KEY = "unify_class";
const TOKEN_KEY = "unify_token";
const USER_KEY = "unify_user";

export { hasSelectedClass } from "./utils";

export function getClassSelection(): ClassSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLASS_KEY);
    return raw ? (JSON.parse(raw) as ClassSelection) : null;
  } catch {
    return null;
  }
}

export function setClassSelection(sel: ClassSelection) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(sel));
  if (typeof document !== "undefined") {
    document.cookie = `${CLASS_KEY}=${encodeURIComponent(
      JSON.stringify(sel)
    )}; path=/; max-age=31536000; SameSite=Lax`;
  }
  window.dispatchEvent(new Event("unify:class-changed"));
}

export function clearClassSelection() {
  localStorage.removeItem(CLASS_KEY);
  if (typeof document !== "undefined") {
    document.cookie = `${CLASS_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
  window.dispatchEvent(new Event("unify:class-changed"));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("unify:auth-changed"));
}

export function updateStoredUser(patch: Partial<User>) {
  const current = getStoredUser();
  if (!current) return;
  const updated = { ...current, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("unify:auth-changed"));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("unify:auth-changed"));
}

/** Reactive hook to get class selection state with hydration guard */
export function useClassSelection(initial?: ClassSelection | null) {
  const [cls, setCls] = useState<ClassSelection | null>(initial ?? null);
  const [loaded, setLoaded] = useState(Boolean(initial));

  useEffect(() => {
    const current = getClassSelection();
    if (current) {
      setCls(current);
      if (typeof document !== "undefined" && !document.cookie.includes(CLASS_KEY)) {
        document.cookie = `${CLASS_KEY}=${encodeURIComponent(
          JSON.stringify(current)
        )}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } else if (initial) {
      setCls(initial);
      localStorage.setItem(CLASS_KEY, JSON.stringify(initial));
    }
    setLoaded(true);
    const sync = () => setCls(getClassSelection());
    window.addEventListener("unify:class-changed", sync);
    return () => window.removeEventListener("unify:class-changed", sync);
  }, [initial]);

  return { cls, loaded };
}

/** Reactive hook to get current user session state with hydration guard */
export function useStoredUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setLoaded(true);
    const sync = () => setUser(getStoredUser());
    window.addEventListener("unify:auth-changed", sync);
    return () => window.removeEventListener("unify:auth-changed", sync);
  }, []);

  return { user, loaded };
}
