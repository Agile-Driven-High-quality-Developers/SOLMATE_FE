// src/components/layout/Layout.tsx
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { stompSubscribe } from "@/lib/stompClient";
import { parseMarketIndicatorMessage, homeQueryKeys } from "@/api/homeApi";
import type { MarketIndexData, MarketIndicatorMessage } from "@/api/homeApi";
import Sidebar from "./Sidebar";
import Logo from "@/components/ui/Logo";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore, useUser } from "@/store/authStore";
import { useNotificationSubscription } from "@/api/notificationApi";

import { useSidebarStore } from "@/store/sidebarStore"; // 스토어 가져오기
import { Menu } from "lucide-react"; // 햄버거 아이콘

function parseJwtSub(token: string): string | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return String(payload.sub ?? payload.userId ?? payload.id ?? "");
  } catch {
    return null;
  }
}

export default function Layout() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const init = useOnboardingStore((s) => s.init);
  const user = useUser();

  const openSidebar = useSidebarStore((s) => s.open); // 사이드바 여는 함수
  const navigate = useNavigate();

  useNotificationSubscription(user?.userId);

  // JWT sub(userId)를 키로 유저별 온보딩 상태 불러오기
  useEffect(() => {
    if (!accessToken) return;
    const userId = parseJwtSub(accessToken);
    if (userId) init(userId);
  }, [accessToken]);

  useEffect(() => {
    return stompSubscribe("/topic/market/indicators", (message) => {
      const msg: MarketIndicatorMessage = JSON.parse(message.body);
      const updated = parseMarketIndicatorMessage(msg);
      const prev = queryClient.getQueryData<MarketIndexData[]>(
        homeQueryKeys.marketIndices,
      );
      // 캐시가 비어있으면 건드리지 않음 — 초기 REST 요청이 알아서 채움
      if (!prev || prev.length === 0) return;
      queryClient.setQueryData<MarketIndexData[]>(
        homeQueryKeys.marketIndices,
        prev.map((item) => (item.label === updated.label ? updated : item)),
      );
    });
  }, [queryClient]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* 사이드바 컴포넌트 */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* 📱 모바일/태블릿용 상단 헤더 (1024px 미만에서만 표시) */}
        <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={openSidebar}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => navigate("/")} className="ml-2 cursor-pointer">
            <p className="text-[18px] font-semibold text-gray-900 leading-tight truncate dark:text-gray-100">
              SOLMate
            </p>
          </button>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {!hasSeenOnboarding && <OnboardingOverlay />}
    </div>
  );
}
