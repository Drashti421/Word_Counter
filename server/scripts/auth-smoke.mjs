const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";

const cookieFromHeaders = (headers) => {
  const raw = headers.get("set-cookie");
  if (!raw) return "";
  const first = raw.split(",")[0];
  return first.split(";")[0];
};

const jsonRequest = async (path, { method = "GET", body, cookie = "" } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data, cookie: cookieFromHeaders(response.headers) };
};

const ensure = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const random = Math.floor(Math.random() * 1_000_000_000);
  const email = `smoke_${random}@example.com`;
  const initialPassword = "password123";
  const newPassword = "newpassword123";

  const healthRes = await fetch(`${baseUrl}/health`);
  ensure(healthRes.ok, "Health endpoint failed");

  const signup = await jsonRequest("/api/auth/signup", {
    method: "POST",
    body: { email, password: initialPassword, displayName: "Smoke User" },
  });
  ensure(signup.response.status === 201, "Signup failed");
  const sessionCookie = signup.cookie;
  ensure(Boolean(sessionCookie), "Session cookie missing after signup");

  const me = await jsonRequest("/api/auth/me", { cookie: sessionCookie });
  ensure(me.response.status === 200, "Auth check (/me) failed after signup");

  const logout = await jsonRequest("/api/auth/logout", { method: "POST", cookie: sessionCookie });
  ensure(logout.response.status === 204, "Logout failed");

  const forgot = await jsonRequest("/api/auth/forgot", {
    method: "POST",
    body: { email },
  });
  ensure([200, 204].includes(forgot.response.status), "Forgot password request failed");

  if (forgot.response.status === 200 && forgot.data?.resetToken) {
    const reset = await jsonRequest("/api/auth/reset", {
      method: "POST",
      body: { token: forgot.data.resetToken, password: newPassword },
    });
    ensure(reset.response.status === 200, "Reset password failed");

    const login = await jsonRequest("/api/auth/login", {
      method: "POST",
      body: { email, password: newPassword },
    });
    ensure(login.response.status === 200, "Login with reset password failed");
  }

  console.log("Auth smoke test passed.");
};

run().catch((error) => {
  console.error("Auth smoke test failed:", error.message);
  process.exit(1);
});
