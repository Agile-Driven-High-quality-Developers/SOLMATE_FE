// src/lib/stompSharedWorker.ts
/// <reference lib="webworker" />

import { Client, type StompSubscription, type IMessage } from "@stomp/stompjs";

const connectedPorts = new Set<MessagePort>();

// destination별 구독 정보 및 해당 구독을 요청한 포트들
const topicSubscriptions = new Map<
  string,
  {
    stompSub: StompSubscription | null;
    subscriberPorts: Set<MessagePort>;
  }
>();

let stompClient: Client | null = null;
let wsConnectionCount = 0; // WebSocket 연결 생성 횟수

// 활성화된 STOMP 연결이 필요한지 확인 후 연결/해제
function checkConnectionRequired(wsUrl?: string) {
  const needsConnection = connectedPorts.size > 0;

  if (needsConnection && !stompClient && wsUrl) {
    wsConnectionCount++;
    console.log(`[STOMP Worker] ✅ WebSocket 연결 생성: 총 ${wsConnectionCount}회 (연결된 탭 수: ${connectedPorts.size})`);

    // http(s) -> ws(s) 프로토콜 변환
    let brokerURL = wsUrl;
    if (wsUrl.startsWith("http")) {
      brokerURL = wsUrl.replace(/^http/, "ws");
    } else if (wsUrl === "/ws") {
      const protocol = self.location.protocol === "https:" ? "wss:" : "ws:";
      brokerURL = `${protocol}//${self.location.host}/ws`;
    }

    stompClient = new Client({
      brokerURL: brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[STOMP Worker] 연결 성공");
        
        // 재연결된 경우 기존 목적지(topic)들을 모두 다시 STOMP 구독
        for (const [destination, info] of topicSubscriptions.entries()) {
          info.stompSub = stompClient!.subscribe(destination, (message) => {
            broadcastToSubscribers(destination, { body: message.body });
          });
        }
      },
      onStompError: (frame) => {
        console.error("[STOMP Worker] STOMP 오류:", frame);
      },
      onWebSocketError: (event) => {
        console.error("[STOMP Worker] 웹소켓 오류:", event);
      },
      onWebSocketClose: () => {
        console.log("[STOMP Worker] 웹소켓 닫힘");
      }
    });

    stompClient.activate();
  } else if (!needsConnection && stompClient) {
    console.log("[STOMP Worker] 접속 중인 포트가 없어 연결을 종료합니다.");
    stompClient.deactivate();
    stompClient = null;
    
    // 초기화 상태
    for (const info of topicSubscriptions.values()) {
      info.stompSub = null;
    }
  }
}

function broadcastToSubscribers(destination: string, message: { body: string }) {
  const info = topicSubscriptions.get(destination);
  if (!info) return;

  // 구독 중인 포트들에게만 브로드캐스트
  const payload = {
    type: "STOMP_MESSAGE",
    destination,
    body: message.body,
  };

  for (const port of info.subscriberPorts) {
    try {
      port.postMessage(payload);
    } catch (e) {
      console.error("[STOMP Worker] 브로드캐스트 실패 - 포트가 닫혔을 수 있습니다:", e);
      info.subscriberPorts.delete(port);
    }
  }
}

// 타입스크립트에게 이 파일이 SharedWorker임을 알립니다.
declare const self: SharedWorkerGlobalScope;

// 탭으로부터 커넥션 요청(onconnect)이 들어왔을 때
self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  connectedPorts.add(port);
  console.log(`[STOMP Worker] 🔌 탭 연결됨 (현재 연결된 탭 수: ${connectedPorts.size})`);

  port.onmessage = (event) => {
    const data = event.data;
    if (!data) return;

    switch (data.type) {
      case "INIT": {
        // 클라이언트가 초기화 시 백엔드 URL을 전달
        checkConnectionRequired(data.wsUrl);
        break;
      }
      case "SUBSCRIBE": {
        const dest = data.destination;
        if (!topicSubscriptions.has(dest)) {
          topicSubscriptions.set(dest, {
            stompSub: null,
            subscriberPorts: new Set(),
          });
        }

        const subInfo = topicSubscriptions.get(dest)!;
        subInfo.subscriberPorts.add(port);

        // STOMP 서버에 연동되어 있지만 구독이 안 된 상태라면 구독 수행
        if (stompClient?.connected && !subInfo.stompSub) {
          subInfo.stompSub = stompClient.subscribe(dest, (message: IMessage) => {
            broadcastToSubscribers(dest, { body: message.body });
          });
        }
        break;
      }
      case "UNSUBSCRIBE": {
        const dest = data.destination;
        const subInfo = topicSubscriptions.get(dest);
        if (subInfo) {
          subInfo.subscriberPorts.delete(port);

          // 이 포트를 제외하고 더 이상 구독자가 없다면 STOMP 구독 해제
          if (subInfo.subscriberPorts.size === 0) {
            if (subInfo.stompSub) {
              subInfo.stompSub.unsubscribe();
            }
            topicSubscriptions.delete(dest);
          }
        }
        break;
      }
      case "DISCONNECT": {
        // 명시적인 해제 요청 시 바로 포트 제거
        handlePortClose(port);
        break;
      }
    }
  };

  port.start();
};

function handlePortClose(port: MessagePort) {
  connectedPorts.delete(port);
  console.log(`[STOMP Worker] ❌ 탭 연결 해제됨 (남은 탭 수: ${connectedPorts.size})`);
  
  // 모든 해당 포트의 구독 해제
  for (const [dest, info] of topicSubscriptions.entries()) {
    info.subscriberPorts.delete(port);
    if (info.subscriberPorts.size === 0) {
      if (info.stompSub) {
        info.stompSub.unsubscribe();
      }
      topicSubscriptions.delete(dest);
    }
  }

  // 더 이상 어떤 포트(탭)도 연결되어 있지 않으면 전체 STOMP 연결 해제
  checkConnectionRequired();
}
