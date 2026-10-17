import test from "node:test";
import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_API_URL = "https://api.unify.test";

const validUser = {
  id: "usr-1",
  email: "test@unify.edu",
  name: "Test User",
  role: "student",
  mustChangePassword: false,
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("production authentication client security controls", async (t) => {
  const originalFetch = globalThis.fetch;
  const { authClient, AuthClientError } = await import("../lib/auth-client.ts");
  const { getSafeRedirectUrl, isRoleAuthorized } = await import("../lib/auth-client.ts");

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test("rejects external and role-conflicting redirects", () => {
    assert.equal(getSafeRedirectUrl("/admin"), "/admin");
    assert.equal(getSafeRedirectUrl("https://evil.example"), null);
    assert.equal(getSafeRedirectUrl("//evil.example"), null);
    assert.equal(getSafeRedirectUrl("/\\evil.example"), null);
    assert.equal(getSafeRedirectUrl("/login?from=/admin"), null);
    assert.equal(isRoleAuthorized("student", "/admin"), false);
    assert.equal(isRoleAuthorized("admin", "/admin/users"), true);
  });

  await t.test("login uses cookies and accepts user-only response", async () => {
    let request;
    let requestInit;
    globalThis.fetch = async (input, init) => {
      request = input;
      requestInit = init;
      return jsonResponse(200, { user: validUser });
    };

    const result = await authClient.signIn({
      email: " TEST@UNIFY.EDU ",
      password: "secret",
    });

    assert.deepEqual(result.user, validUser);
    assert.equal(requestInit.credentials, "include");
    assert.equal(request, "https://api.unify.test/api/auth/login");
    assert.deepEqual(JSON.parse(requestInit.body), {
      email: "test@unify.edu",
      password: "secret",
    });
  });

  await t.test("coordinates concurrent refresh into one network flow", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      if (calls === 1) return jsonResponse(401, { code: "TOKEN_EXPIRED" });
      return jsonResponse(200, { user: validUser });
    };

    const [first, second, third] = await Promise.all([
      authClient.refreshSession(),
      authClient.refreshSession(),
      authClient.refreshSession(),
    ]);

    assert.deepEqual([first, second, third], [validUser, validUser, validUser]);
    assert.equal(calls, 2);
  });

  await t.test("retries protected 401 once after refresh", async () => {
    let calls = 0;
    globalThis.fetch = async (input) => {
      calls += 1;
      const url = typeof input === "string" ? input : input.url;
      if (calls === 1 && url.endsWith("/api/users")) {
        return jsonResponse(401, { code: "TOKEN_EXPIRED" });
      }
      if (url.endsWith("/api/auth/me")) {
        return jsonResponse(401, { code: "TOKEN_EXPIRED" });
      }
      if (url.endsWith("/api/auth/refresh")) {
        return jsonResponse(200, { user: validUser });
      }
      return jsonResponse(200, []);
    };

    const response = await authClient.fetch("https://api.unify.test/api/users");
    assert.equal(response.status, 200);
    assert.equal(calls, 4);
  });

  await t.test("preserves network failure as network state", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("offline");
    };

    await assert.rejects(
      () => authClient.getSession(),
      (error) => error instanceof AuthClientError && error.kind === "network"
    );
  });
});
