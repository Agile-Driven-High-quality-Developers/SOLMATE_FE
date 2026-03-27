import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingState {
  hasSeenOnboarding: boolean;
  seenTours: Record<string, boolean>;
  currentUserId: string | null;
  init: (userId: string) => void;
  markAsSeen: () => void;
  markTourSeen: (key: string) => void;
  resetTour: (key: string) => void;
}

// ─── localStorage 헬퍼 ────────────────────────────────────────────────────────

const storageKey = (userId: string) => `solmate-onboarding-${userId}`;

function loadState(userId: string) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { hasSeenOnboarding: false, seenTours: {} };
    return JSON.parse(raw) as { hasSeenOnboarding: boolean; seenTours: Record<string, boolean> };
  } catch {
    return { hasSeenOnboarding: false, seenTours: {} };
  }
}

function saveState(
  userId: string,
  hasSeenOnboarding: boolean,
  seenTours: Record<string, boolean>,
) {
  localStorage.setItem(storageKey(userId), JSON.stringify({ hasSeenOnboarding, seenTours }));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  hasSeenOnboarding: false,
  seenTours: {},
  currentUserId: null,

  // 로그인 후 유저 ID로 해당 유저의 상태를 불러옴
  init: (userId: string) => {
    const saved = loadState(userId);
    set({ currentUserId: userId, ...saved });
  },

  markAsSeen: () => {
    const { currentUserId, seenTours } = get();
    set({ hasSeenOnboarding: true });
    if (currentUserId) saveState(currentUserId, true, seenTours);
  },

  markTourSeen: (key: string) => {
    const { currentUserId, hasSeenOnboarding, seenTours } = get();
    const updated = { ...seenTours, [key]: true };
    set({ seenTours: updated });
    if (currentUserId) saveState(currentUserId, hasSeenOnboarding, updated);
  },

  resetTour: (key: string) => {
    const { currentUserId, hasSeenOnboarding, seenTours } = get();
    const updated = { ...seenTours, [key]: false };
    set({ seenTours: updated });
    if (currentUserId) saveState(currentUserId, hasSeenOnboarding, updated);
  },
}));
