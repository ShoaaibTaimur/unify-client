"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("unify_theme", dark ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full ${className ?? ""}`}
      aria-label="Toggle color theme"
      onClick={toggleTheme}
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </Button>
  );
}
