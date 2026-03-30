import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      // 초기값
      theme: "light",

      // Actions — set 안에서 document 조작도 가능
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle("dark", next === "dark");
          return { theme: next };
        }),

      setTheme: (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        set({ theme });
      },
    }),
    {
      name: "solmate-theme", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 새로고침 시 저장된 theme 복원 후 클래스 동기화
      onRehydrateStorage: () => (state) => {
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);