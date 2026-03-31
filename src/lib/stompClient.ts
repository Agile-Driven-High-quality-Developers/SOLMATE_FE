// src/lib/stompClient.ts
// 앱 전체에서 단 하나의 공유된 STOMP 연결(SharedWorker)을 사용합니다.
import type { messageCallbackType, IMessage } from "@stomp/stompjs";

// SharedWorker 인스턴스 생성 (Vite 모듈 워커 사용)
const worker = new SharedWorker(new URL("./stompSharedWorker.ts", import.meta.url), { type: "module", name: "solmate-stomp-worker" });

// VITE_API_BASE_URL 환경변수 사용
const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";

// 초기화: 백엔드 웹소켓 URL 전송
worker.port.postMessage({ type: "INIT", wsUrl });

type SubscriptionEntry = {
  destination: string;
  callback: messageCallbackType;
};

// 탭 내부의 구독 콜백 리스트
const registry = new Map<symbol, SubscriptionEntry>();

// 워커에서 STOMP 메시지 수신 시 처리
worker.port.onmessage = (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === "STOMP_MESSAGE") {
    const destination = data.destination;
    registry.forEach((entry) => {
      // 탭 내부에서 해당 destination을 구독 중인 모든 콜백 실행
      if (entry.destination === destination) {
        // 호환성을 위해 IMessage 객체를 흉내냅니다
        const mockMessage: IMessage = {
          body: data.body,
          ack: () => {},
          nack: () => {},
          command: "MESSAGE",
          headers: { destination },
          isBinaryBody: false,
          binaryBody: new Uint8Array(),
        };
        entry.callback(mockMessage);
      }
    });
  }
};

worker.port.start();

/**
 * SharedWorker를 통해 STOMP 토픽을 구독합니다.
 * @returns 구독을 해제하는 cleanup 함수
 */
export function stompSubscribe(
  destination: string,
  callback: messageCallbackType,
): () => void {
  const key = Symbol();
  registry.set(key, { destination, callback });

  // 동일한 destination에 대해 이 탭에서 처음으로 구독하는 것이라면 Worker에 실제 구독 요청(SUBSCRIBE)을 전송
  const currentCount = Array.from(registry.values()).filter(e => e.destination === destination).length;
  if (currentCount === 1) {
    worker.port.postMessage({ type: "SUBSCRIBE", destination });
  }

  return () => {
    registry.delete(key);
    // 이 탭에서 더 이상 해당 destination을 구독하는 컴포넌트가 없으면 Worker에 해제 요청(UNSUBSCRIBE)을 전송
    const remainingCount = Array.from(registry.values()).filter(e => e.destination === destination).length;
    if (remainingCount === 0) {
      worker.port.postMessage({ type: "UNSUBSCRIBE", destination });
    }
  };
}

// 명시적으로 탭(또는 브라우저)이 닫힐 때 Worker에 연결 해제를 알립니다.
window.addEventListener("beforeunload", () => {
  worker.port.postMessage({ type: "DISCONNECT" });
  worker.port.close();
});
