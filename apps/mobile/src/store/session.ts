import type { SessionUser } from "@kite/shared-types";
import { create } from "zustand";
import { clearTokens, saveTokens } from "../lib/session-store";

type SessionState = {
  user: SessionUser | null;
  hydrated: boolean;
  promptNotifications: boolean;
  setUser: (user: SessionUser | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setPromptNotifications: (promptNotifications: boolean) => void;
  signIn: (user: SessionUser, accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useSession = create<SessionState>((set) => ({
  user: null,
  hydrated: false,
  promptNotifications: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  setPromptNotifications: (promptNotifications) => set({ promptNotifications }),
  signIn: async (user, accessToken, refreshToken) => {
    await saveTokens(accessToken, refreshToken);
    set({ user, hydrated: true, promptNotifications: !user.onboardingComplete });
  },
  signOut: async () => {
    await clearTokens();
    set({ user: null, hydrated: true, promptNotifications: false });
  },
}));
