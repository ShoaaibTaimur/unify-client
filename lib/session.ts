"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ClassSelection } from "@/types";

const CLASS_KEY = "unify_class";

export { hasSelectedClass } from "./utils";

let cachedRaw: string | null = null;
let cachedParsed: ClassSelection | null = null;

export function getClassSelection(): ClassSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLASS_KEY);
    if (!raw) return null;
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    cachedParsed = JSON.parse(raw) as ClassSelection;
    return cachedParsed;
  } catch {
    return null;
  }
}

export function setClassSelection(sel: ClassSelection) {
  cachedRaw = JSON.stringify(sel);
  cachedParsed = sel;
  localStorage.setItem(CLASS_KEY, cachedRaw);
  if (typeof document !== "undefined") {
    document.cookie = `${CLASS_KEY}=${encodeURIComponent(
      cachedRaw
    )}; path=/; max-age=31536000; SameSite=Lax`;
  }
  window.dispatchEvent(new Event("unify:class-changed"));
}

export function clearClassSelection() {
  cachedRaw = null;
  cachedParsed = null;
  localStorage.removeItem(CLASS_KEY);
  if (typeof document !== "undefined") {
    document.cookie = `${CLASS_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
  window.dispatchEvent(new Event("unify:class-changed"));
}

function subscribeClass(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("unify:class-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("unify:class-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export function useClassSelection(initial?: ClassSelection | null) {
  const [mounted, setMounted] = useState(false);
  const clientCls = useSyncExternalStore(
    subscribeClass,
    getClassSelection,
    () => initial ?? null
  );

  useEffect(() => {
    setMounted(true);
    const cur = getClassSelection();
    if (cur && typeof document !== "undefined") {
      document.cookie = `${CLASS_KEY}=${encodeURIComponent(
        JSON.stringify(cur)
      )}; path=/; max-age=31536000; SameSite=Lax`;
    } else if (initial && !cur) {
      setClassSelection(initial);
    }
  }, [initial]);

  const cls = mounted ? (clientCls ?? initial ?? null) : (initial ?? null);
  const loaded = mounted || Boolean(initial);

  return { cls, loaded };
}


