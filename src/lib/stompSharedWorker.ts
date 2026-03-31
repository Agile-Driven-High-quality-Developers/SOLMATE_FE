// src/lib/stompSharedWorker.ts
/// <reference lib="webworker" />

import { Client, type StompSubscription, type IMessage } from "@stomp/stompjs";

const connectedPorts = new Set<MessagePort>();
const portLastSeen = new Map<MessagePort, number>();

const topicSubscriptions = new Map<
  string,
  {
    stompSub: StompSubscription | null;
    subscriberPorts: Set<MessagePort>;
  }
>();

let stompClient: Client | null = null;
let wsConnectionCount = 0; // WebSocket 연결 생성 횟수

function checkConnectionRequired(wsUrl?: string) {
  const needsConnection = connectedPorts.size > 0;

  if (needsConnection && !stompClient && wsUrl) {
    wsConnectionCount++;
    console.log(`[STOMP Worker] ✅ WebSocket 연결 생성: 총 ${wsConnectionCount}회 (연결된 탭 수: ${connectedPorts.size})`);

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
    
    for (const info of topicSubscriptions.values()) {
      info.stompSub = null;
    }
  }
}

function broadcastToSubscribers(destination: string, message: { body: string }) {
  const info = topicSubscriptions.get(destination);
  if (!info) return;

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
      handlePortClose(port);
    }
  }
}

declare const self: SharedWorkerGlobalScope;

self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  connectedPorts.add(port);
  console.log(`[STOMP Worker] 🔌 탭 연결됨 (현재 연결된 탭 수: ${connectedPorts.size})`);

  portLastSeen.set(port, Date.now());

  port.onmessage = (event) => {
    const data = event.data;
    if (!data) return;

    portLastSeen.set(port, Date.now());

    switch (data.type) {
      case "PING": {
        break;
      }
      case "INIT": {
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
        handlePortClose(port);
        break;
      }
    }
  };

  port.start();
};

function handlePortClose(port: MessagePort) {
  if (!connectedPorts.has(port)) return;
  connectedPorts.delete(port);
  portLastSeen.delete(port);
  console.log(`[STOMP Worker] ❌ 탭 연결 해제됨 (남은 탭 수: ${connectedPorts.size})`);

  for (const [dest, info] of topicSubscriptions.entries()) {
    info.subscriberPorts.delete(port);
    if (info.subscriberPorts.size === 0) {
      if (info.stompSub) {
        info.stompSub.unsubscribe();
      }
      topicSubscriptions.delete(dest);
    }
  }

  checkConnectionRequired();
}

const PING_TIMEOUT_MS = 15000;
const DEAD_PORT_CHECK_INTERVAL_MS = 10000;

setInterval(() => {
  const now = Date.now();
  for (const port of connectedPorts) {
    const last = portLastSeen.get(port) ?? 0;
    if (now - last > PING_TIMEOUT_MS) {
      console.log("[STOMP Worker] 응답 없는 포트 감지 - 정리합니다.");
      handlePortClose(port);
    }
  }
}, DEAD_PORT_CHECK_INTERVAL_MS);
