import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hasSeenSpotlight: boolean;
  markAsSeen: () => void;
  markSpotlightSeen: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      hasSeenSpotlight: false,
      markAsSeen: () => set({ hasSeenOnboarding: true }),
      markSpotlightSeen: () => set({ hasSeenSpotlight: true }),
    }),
    {
      name: "solmate-onboarding",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
