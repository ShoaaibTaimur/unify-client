import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { RootLayout } from "@/components/RootLayout";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "UNIFY — One place for every academic activity",
  description:
    "UNIFY helps university students, CRs, teachers, and admins track class tests, labs, viva, assignments, and exams — organized by Department, Batch, and Section.",
  authors: [{ name: "UNIFY" }],
  openGraph: {
    title: "UNIFY — One place for every academic activity",
    description:
      "A premium academic activity portal for universities. See what's today, what's next, and what's coming up — for your class.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("unify_theme");var p=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&p)){document.documentElement.classList.add("dark");}}catch(e){}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <RootLayout>{children}</RootLayout>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
