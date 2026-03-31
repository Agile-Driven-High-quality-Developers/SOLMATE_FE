import type { messageCallbackType, IMessage } from "@stomp/stompjs";

const worker = new SharedWorker(new URL("./stompSharedWorker.ts", import.meta.url), { type: "module", name: "solmate-stomp-worker" });

const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";

worker.port.postMessage({ type: "INIT", wsUrl });

setInterval(() => {
  worker.port.postMessage({ type: "PING" });
}, 5000);

type SubscriptionEntry = {
  destination: string;
  callback: messageCallbackType;
};

const registry = new Map<symbol, SubscriptionEntry>();

worker.port.onmessage = (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === "STOMP_MESSAGE") {
    const destination = data.destination;
    registry.forEach((entry) => {
      if (entry.destination === destination) {
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


export function stompSubscribe(
  destination: string,
  callback: messageCallbackType,
): () => void {
  const key = Symbol();
  registry.set(key, { destination, callback });

  const currentCount = Array.from(registry.values()).filter(e => e.destination === destination).length;
  if (currentCount === 1) {
    worker.port.postMessage({ type: "SUBSCRIBE", destination });
  }

  return () => {
    registry.delete(key);
    const remainingCount = Array.from(registry.values()).filter(e => e.destination === destination).length;
    if (remainingCount === 0) {
      worker.port.postMessage({ type: "UNSUBSCRIBE", destination });
    }
  };
}

window.addEventListener("beforeunload", () => {
  worker.port.postMessage({ type: "DISCONNECT" });
  worker.port.close();
});
