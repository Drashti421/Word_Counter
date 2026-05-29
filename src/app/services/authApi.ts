export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface PasswordResetRequestResponse {
  message?: string;
  resetToken?: string;
  expiresInMinutes?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const API_TIMEOUT_MS = 10000;

const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out. Backend may be unavailable at ${API_BASE_URL}.`);
    }
    throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Start server with: npm run dev:server`);
  } finally {
    clearTimeout(timeout);
  }
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { message?: string };
      throw new Error(data?.message || `Request failed with ${response.status}`);
    }
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
};

const parseNoContent = async (response: Response): Promise<void> => {
  if (!response.ok && response.status !== 204) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await apiFetch("/api/auth/me", {
    credentials: "include",
  });
  return parseResponse<AuthUser>(response);
};

export const signup = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthUser> => {
  const response = await apiFetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password, displayName }),
  });
  return parseResponse<AuthUser>(response);
};

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<AuthUser>(response);
};

export const logout = async (): Promise<void> => {
  const response = await apiFetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return parseNoContent(response);
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetRequestResponse> => {
  const response = await apiFetch("/api/auth/forgot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (response.status === 204) {
    return { message: "If that account exists, a reset link was sent." };
  }
  return parseResponse<PasswordResetRequestResponse>(response);
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  const response = await apiFetch("/api/auth/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token, password }),
  });
  return parseNoContent(response);
};
