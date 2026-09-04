const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4400";
const API_URL = /^https?:\/\//.test(RAW_API_URL) ? RAW_API_URL : `https://${RAW_API_URL}`;
const TOKEN_KEY = "ibiblia_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch that patiently waits for a sleeping free-tier API to wake: retries on network errors
 * and on Render's 502/503/504 "waking up" responses for up to ~60s, so users see a brief
 * loading state instead of "failed to fetch".
 */
async function fetchWithWake(url: string, init: RequestInit): Promise<Response> {
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if ([502, 503, 504].includes(res.status) && attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not reach the server. Please try again.");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetchWithWake(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    clearToken();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AdminUser>("/auth/me"),
  counts: () => request<Record<string, number>>("/admin/counts"),
  list: <T = Record<string, unknown>>(resource: string) => request<T[]>(`/admin/${resource}`),
  get: <T = Record<string, unknown>>(resource: string, id: string) =>
    request<T>(`/admin/${resource}/${id}`),
  create: <T = Record<string, unknown>>(resource: string, data: unknown) =>
    request<T>(`/admin/${resource}`, { method: "POST", body: JSON.stringify(data) }),
  update: <T = Record<string, unknown>>(resource: string, id: string, data: unknown) =>
    request<T>(`/admin/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (resource: string, id: string) =>
    request<{ deleted: boolean }>(`/admin/${resource}/${id}`, { method: "DELETE" }),

  /** Previously uploaded images (the gallery). */
  gallery: () => request<MediaAsset[]>("/admin/uploads"),

  /** Delete an image from the gallery. */
  deleteUpload: (id: string) =>
    request<{ deleted: boolean }>(`/admin/uploads/${id}`, { method: "DELETE" }),

  /** Upload a local image file; returns the stored asset (with a public URL). */
  uploadImage: async (file: File): Promise<MediaAsset> => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/admin/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      let message = "Upload failed";
      try {
        const body = (await res.json()) as { message?: string | string[] };
        if (body.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      } catch {
        /* ignore */
      }
      throw new ApiError(res.status, message);
    }
    return (await res.json()) as MediaAsset;
  },
};

export interface MediaAsset {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
