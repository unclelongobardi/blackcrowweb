"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

async function resolveAccessToken(
  getAccessToken: () => Promise<string | null>,
  ready: boolean,
  authenticated: boolean,
): Promise<string | undefined> {
  if (!ready || !authenticated) return undefined;
  for (let attempt = 0; attempt < 6; attempt++) {
    const token = await getAccessToken();
    if (token) return token;
    await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
  }
  return undefined;
}

export function useApi() {
  const { getAccessToken, ready, authenticated } = usePrivy();

  return useCallback(
    async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await resolveAccessToken(getAccessToken, ready, authenticated);
      const isForm = options.body instanceof FormData;
      const res = await fetch(path, {
        ...options,
        headers: {
          ...(!isForm ? { "content-type": "application/json" } : {}),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
      }
      return data as T;
    },
    [getAccessToken, ready, authenticated],
  );
}
