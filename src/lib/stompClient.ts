// src/lib/stompClient.ts
// 앱 전체에서 단 하나의 STOMP 연결을 공유합니다.
// SockJS 협상(info 요청 + WebSocket 업그레이드)은 최초 1회만 발생합니다.
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { StompSubscription, messageCallbackType } from "@stomp/stompjs";

type SubscriptionEntry = {
  destination: string;
  callback: messageCallbackType;
  subscription?: StompSubscription;
};

const registry = new Map<symbol, SubscriptionEntry>();

const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";

const sharedClient = new Client({
  webSocketFactory: () => new SockJS(wsUrl),
  reconnectDelay: 5000,
  onConnect: () => {
    // 재연결 시 모든 구독을 자동으로 복구합니다
    registry.forEach((entry) => {
      entry.subscription = sharedClient.subscribe(
        entry.destination,
        entry.callback,
      );
    });
  },
});

sharedClient.activate();

/**
 * STOMP 토픽을 구독합니다.
 * @returns 구독을 해제하는 cleanup 함수
 */
export function stompSubscribe(
  destination: string,
  callback: messageCallbackType,
): () => void {
  const key = Symbol();
  const entry: SubscriptionEntry = { destination, callback };
  registry.set(key, entry);

  if (sharedClient.connected) {
    entry.subscription = sharedClient.subscribe(destination, callback);
  }
  // 미연결 상태면 onConnect에서 자동 구독됩니다

  return () => {
    entry.subscription?.unsubscribe();
    registry.delete(key);
  };
}
