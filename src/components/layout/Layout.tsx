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
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function Layout() {
  const queryClient = useQueryClient();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hasSeenSpotlight = useOnboardingStore((s) => s.hasSeenSpotlight);

  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        console.log("[STOMP] 연결됨");
        client.subscribe("/topic/market/indicators", (message) => {
          const msg: MarketIndicatorMessage = JSON.parse(message.body);
          const updated = parseMarketIndicatorMessage(msg);
          queryClient.setQueryData<MarketIndexData[]>(
            homeQueryKeys.marketIndices,
            (prev = []) =>
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
      {hasSeenOnboarding && !hasSeenSpotlight && <SpotlightTour />}
      {import.meta.env.DEV && (
        <button
          className="fixed bottom-4 right-4 z-[999] bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => {
            localStorage.removeItem("solmate-onboarding");
            window.location.reload();
          }}
        >
          🔄 온보딩 초기화
        </button>
      )}
    </div>
  );
}
