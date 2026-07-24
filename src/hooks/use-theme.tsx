import { useEffect, useState, useCallback } from "react";

const KEY = "unify_theme";
type Theme = "light" | "dark";

function apply(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem(KEY) : null) as Theme | null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    apply(initial);
    const sync = () => {
      const t = (localStorage.getItem(KEY) as Theme | null) ?? "light";
      setTheme(t);
      apply(t);
    };
    window.addEventListener("unify:theme-changed", sync);
    return () => window.removeEventListener("unify:theme-changed", sync);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    apply(next);
    setTheme(next);
    window.dispatchEvent(new Event("unify:theme-changed"));
  }, [theme]);

  return { theme, toggle };
}
