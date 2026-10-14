import { NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl, validateOrigin } from "@/lib/auth/config";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  password: z.string().min(6).max(128),
  role: z.enum(["student", "cr", "teacher"]).optional(),
  departmentId: z.string().optional(),
  batchId: z.string().optional(),
  sectionId: z.string().optional(),
});

export async function POST(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests prohibited" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration fields", details: parsed.error.flatten() }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "unify-bff",
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || "Registration failed";
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    if (data?.accessToken && data?.refreshToken) {
      await setAuthCookies(data.accessToken, data.refreshToken, {
        maxAge: data.expiresIn,
        refreshMaxAge: data.refreshExpiresIn,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        user: data.user,
      },
      { status: 201 }
    );
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json({ error: "Registration service timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Unable to reach registration service" }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
