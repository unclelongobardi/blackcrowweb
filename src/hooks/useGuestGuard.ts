"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAppContext } from "@/components/app/appContext";

export function useGuestGuard() {
  const { isGuest } = useAppContext();
  const { login, ready, authenticated } = usePrivy();

  const blocked = isGuest || !authenticated;

  const promptLogin = useCallback(() => {
    if (ready) login();
  }, [ready, login]);

  const requireAuth = useCallback(
    (onAllowed?: () => void): boolean => {
      if (blocked) {
        promptLogin();
        return false;
      }
      onAllowed?.();
      return true;
    },
    [blocked, promptLogin],
  );

  return { isGuest, blocked, canAct: !blocked, requireAuth, promptLogin };
}
