"use client";

import { isApiConfigured } from "@/lib/api";

export default function SettingsPage() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  return (
    <div>
      <h1 className="font-display text-4xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Environment and integration settings.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl">Backend</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isApiConfigured ? (
            <>
              Connected to <code>{url}</code>.
            </>
          ) : (
            <>
              <b>Not connected.</b> Deploy the API in <code>/server</code> to
              Vercel, then set <code>NEXT_PUBLIC_API_URL</code> to your backend
              URL (e.g. <code>https://your-app.vercel.app</code>).
            </>
          )}
        </p>
      </div>
    </div>
  );
}
