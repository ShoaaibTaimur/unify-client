"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";

const BARE_ROOTS = ["/login", "/change-password", "/admin", "/cr", "/teacher"];

export function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const bare = BARE_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`)
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden max-w-full">
      {!bare && <SiteHeader />}
      <main
        key={pathname}
        className="flex-1 w-full max-w-full overflow-x-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {children}
      </main>
      {!bare && <SiteFooter />}
      <Toaster position="top-right" theme={theme} closeButton />
    </div>
  );
}
