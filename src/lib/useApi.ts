"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function useApi() {
  const { getAccessToken } = usePrivy();

  return useCallback(
    async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await getAccessToken();
      const res = await fetch(path, {
        ...options,
        headers: {
          "content-type": "application/json",
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
    [getAccessToken],
  );
}
