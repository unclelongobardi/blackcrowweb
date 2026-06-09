"use client";

import { createContext, useContext } from "react";
import type { Profile } from "@/lib/types";

export type Me = {
  authenticated: boolean;
  profile: Profile;
  stats: { cabals: number; bounties_posted: number; bounties_done: number; posts: number; rank: number };
};

type AppContextValue = {
  me: Me | null;
  refreshMe: () => Promise<void>;
};

export const AppContext = createContext<AppContextValue>({
  me: null,
  refreshMe: async () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}
