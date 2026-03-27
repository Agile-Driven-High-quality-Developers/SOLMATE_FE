// src/components/layout/Layout.tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  parseMarketIndicatorMessage,
  homeQueryKeys,
} from "@/api/homeApi";
import type { MarketIndexData, MarketIndicatorMessage } from "@/api/homeApi";
import Sidebar from "./Sidebar";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";

function parseJwtSub(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
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

  // JWT sub(userId)를 키로 유저별 온보딩 상태 불러오기
  useEffect(() => {
    if (!accessToken) return;
    const userId = parseJwtSub(accessToken);
    if (userId) init(userId);
  }, [accessToken]);

  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        console.log("[STOMP] 연결됨");
        client.subscribe("/topic/market/indicators", (message) => {
          const msg: MarketIndicatorMessage = JSON.parse(message.body);
          const updated = parseMarketIndicatorMessage(msg);
          const prev = queryClient.getQueryData<MarketIndexData[]>(
            homeQueryKeys.marketIndices,
          );
          // 캐시가 비어있으면 건드리지 않음 — 초기 REST 요청이 알아서 채움
          if (!prev || prev.length === 0) return;
          queryClient.setQueryData<MarketIndexData[]>(
            homeQueryKeys.marketIndices,
            prev.map((item) =>
              item.label === updated.label ? updated : item,
            ),
          );
        });
      },
      onDisconnect: () => console.log("[STOMP] 연결 끊김"),
      onStompError: (frame) => console.error("[STOMP] 에러:", frame),
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [queryClient]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      {!hasSeenOnboarding && <OnboardingOverlay />}
    </div>
  );
}
