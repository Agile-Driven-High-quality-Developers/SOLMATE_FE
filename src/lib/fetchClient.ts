import { useAuthStore } from "@/store/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = BASE_URL || window.location.origin;
  const url = new URL(path, base);
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  // BASE_URL 없으면 Vite 프록시를 통해 요청 (상대 경로)
  return BASE_URL ? url.toString() : url.pathname + url.search;
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
  _retry = true,
): Promise<T> {
  const { params, headers, ...init } = options;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(buildUrl(path, params), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  // 401/403: 토큰 재발급 후 1회 재시도
  if ((res.status === 401 || res.status === 403) && _retry) {
    try {
      const reissueRes = await fetch(buildUrl("/api/auth/reissue"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!reissueRes.ok) throw new Error();
      const { data } = await reissueRes.json();
      if (!data?.accessToken) throw new Error();
      useAuthStore.getState().setAccessToken(data.accessToken);
      return request<T>(path, options, false);
    } catch {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const err = new Error(`HTTP ${res.status}`) as Error & { status: number; data: unknown };
    err.status = res.status;
    err.data = errorData;
    throw err;
  }
  return res.json() as Promise<T>;
}

export const fetchClient = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
