import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  nickname: string;
}

interface AuthState {
  accessToken: string | null; // sessionStorage에 persist
  user: AuthUser | null;      // sessionStorage에 persist
  // isLoggedIn 제거 → accessToken !== null 으로 파생
}

interface AuthActions {
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // ── 초기값
      accessToken: null,
      user: null,

      // ── Actions
      setAuth: (accessToken, user) => set({ accessToken, user }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "solmate-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useUser = () => useAuthStore((s) => s.user);
export const useIsLoggedIn = () => useAuthStore((s) => s.accessToken !== null);
export const useAccessToken = () => useAuthStore((s) => s.accessToken);
