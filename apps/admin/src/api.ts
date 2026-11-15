export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8787").replace(/\/$/, "");

const KEY = "kai.admin.token";

export const auth = {
  get: () => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY)
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    method: init.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(auth.get() ? { authorization: `Bearer ${auth.get()}` } : {})
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  });
  if (res.status === 401 && path !== "/admin/login") {
    auth.clear();
    onUnauthorized();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.issues?.map((i: { path: string[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join(", ") ||
      data?.error ||
      `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}
