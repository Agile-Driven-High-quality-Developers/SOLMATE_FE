import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login Response의 data 필드 기준
// refreshToken은 body에 있지만 httpOnly 쿠키로 관리 → 프론트에서 무시
export interface AuthUser {
  nickname: string;
}

interface AuthState {
  accessToken: string | null;  // sessionStorage에 persist
  user: AuthUser | null;       // sessionStorage에 persist
  isLoggedIn: boolean;         // sessionStorage에 persist
}

interface AuthActions {
  // 로그인 성공 후 호출 (email / google 공통)
  // refreshToken은 httpOnly 쿠키로 서버가 관리하므로 인자에서 제외
  setAuth: (accessToken: string, user: AuthUser) => void;

  // accessToken 갱신 — POST /api/v1/auth/reissue 성공 후 호출
  // reissue 요청 시 refreshToken은 쿠키에서 자동 포함 (withCredentials: true)
  setAccessToken: (accessToken: string) => void;

  // 로그아웃 — POST /api/v1/auth/logout 성공 후 호출
  // 서버가 Set-Cookie: Max-Age=0 으로 refreshToken 쿠키 삭제
  clearAuth: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // ── 초기값
      accessToken: null,
      user: null,
      isLoggedIn: false,

      // ── Actions
      setAuth: (accessToken, user) =>
        set({ accessToken, user, isLoggedIn: true }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      clearAuth: () =>
        set({ accessToken: null, user: null, isLoggedIn: false }),
    }),
    {
      name: "solmate-auth",
      storage: createJSONStorage(() => sessionStorage), // 탭 닫으면 자동 삭제
      // accessToken도 sessionStorage에 저장 — 새로고침 시 reissue로 갱신
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useUser = () => useAuthStore((s) => s.user);
export const useIsLoggedIn = () => useAuthStore((s) => s.isLoggedIn);
export const useAccessToken = () => useAuthStore((s) => s.accessToken);