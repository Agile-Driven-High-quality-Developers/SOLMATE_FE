import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useStockQuoteQuery,
  useStockHoldingQuery,
  useCashBalanceQuery,
  useStockTradeHistoryQuery,
  useOrderBookQuery,
  stockQueryKeys,
} from "@/api/stockApi";
import { useBuyOrderMutation, useSellOrderMutation } from "@/api/tradeApi";
import type { StockQuote, StockItemMessage, OrderBookData } from "@/api/stockApi";

import { useStockStore } from "@/store/stockStore";
import StockDetailHeader from "@/components/stocks/StockDetailHeader";
import StockInfoGrid from "@/components/stocks/StockInfoGrid";
import TradeHistory from "@/components/stocks/TradeHistory";
import HoldingStatus from "@/components/stocks/HoldingStatus";
import OrderBook from "@/components/stocks/OrderBook";
import StockChart from "@/components/stocks/StockChart";
import TradeOrderModal from "@/components/stocks/TradeOrderModal";
import type { OrderSide } from "@/components/stocks/TradeOrderModal";
import TradeConfirmModal from "@/components/stocks/TradeConfirmModal";

type PendingOrder = {
  side: OrderSide;
  orderType: "MARKET" | "LIMIT";
  price: number;
  quantity: number;
  diary: string;
};

export default function StockDetailPage() {
  const { stockCode = "" } = useParams<{ stockCode: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedStock = useStockStore((s) => s.selectedStock);

  const [orderSide, setOrderSide] = useState<OrderSide | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);

  const buyMutation = useBuyOrderMutation();
  const sellMutation = useSellOrderMutation();

  const { data: quote, isLoading } = useStockQuoteQuery(stockCode);
  const { data: holding } = useStockHoldingQuery(stockCode);
  const { data: cash } = useCashBalanceQuery();
  const { data: tradeHistory } = useStockTradeHistoryQuery(stockCode);
  const { data: orderBook } = useOrderBookQuery(stockCode);

  // ── 실시간 연결 (백엔드 스케줄러가 자동 구독 → STOMP 수신만 하면 됨) ────
  useEffect(() => {
    if (!stockCode) return;

    const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        console.log("[STOMP] 종목 상세 연결됨:", stockCode);
        client.subscribe(`/topic/stocks/${stockCode}/quote`, (message) => {
          const msg: StockItemMessage = JSON.parse(message.body);
          queryClient.setQueryData<StockQuote>(
            stockQueryKeys.quote(stockCode),
            (prev) =>
              prev
                ? {
                    ...prev,
                    currentPrice: msg.currentPrice,
                    changePrice: msg.changePrice,
                    changeRate: msg.changeRate,
                    highPrice: msg.highPrice,
                    lowPrice: msg.lowPrice,
                    volume: msg.volume,
                  }
                : prev,
          );
        });

        client.subscribe(`/topic/orderbook/${stockCode}`, (message) => {
          const raw = JSON.parse(message.body);
          console.log("[STOMP] 호가 원본:", JSON.stringify(raw));
          const msg: OrderBookData = raw.data ?? raw;
          queryClient.setQueryData<OrderBookData>(
            stockQueryKeys.orderBook(stockCode),
            msg,
          );
        });
      },
      onDisconnect: () => console.log("[STOMP] 종목 상세 연결 끊김"),
      onStompError: (frame) => console.error("[STOMP] 에러:", frame),
    });
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [stockCode, queryClient]);

  // ── 브라우저 탭 제목 실시간 업데이트 ────────────────────────────────────
  useEffect(() => {
    if (!quote) return;
    const rate = quote.changeRate;
    document.title = `${quote.currentPrice.toLocaleString()}원 ${rate > 0 ? "+" : ""}${rate.toFixed(2)}% | ${quote.stockName}`;

    const setFavicon = (href: string) => {
      const existing = document.querySelector("link[rel='icon']");
      if (existing) existing.remove();
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = href;
      document.head.appendChild(link);
    };

    if (quote.stockLogo) setFavicon(quote.stockLogo);

    return () => {
      document.title = "SOLMATE";
      setFavicon("/vite.svg");
    };
  }, [quote]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen text-[14px] text-gray-400">
        종목 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const headerStock = {
    tickerCode: quote.stockCode,
    stockName: quote.stockName,
    stockLogo: quote.stockLogo,
    sectorType: selectedStock?.sectorType ?? "",
    currentPrice: quote.currentPrice,
    change: quote.changePrice,
    changeRate: quote.changeRate,
    open: quote.openPrice,
    high: quote.highPrice,
    low: quote.lowPrice,
    prevClose: quote.previousClosePrice,
    volume: quote.volume,
    marketCap: quote.total,
  };

  return (
    <>
    <div className="flex flex-col p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      <StockDetailHeader stock={headerStock} />

      <div className="flex gap-5 items-start">
        {/* 왼쪽 */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <StockChart stockCode={stockCode} />

          <StockInfoGrid quote={quote} />

          <TradeHistory
            tickerCode={stockCode}
            orders={tradeHistory?.orders ?? []}
          />
        </div>

        {/* 오른쪽 */}
        <div className="w-60 shrink-0 flex flex-col gap-4">
          <HoldingStatus
            holding={holding}
            cash={cash}
            onBuy={() => setOrderSide("buy")}
            onSell={() => setOrderSide("sell")}
          />
          {orderBook && <OrderBook orderBook={orderBook} />}
        </div>
      </div>
    </div>

    {orderSide && (
      <TradeOrderModal
        side={orderSide}
        stockName={quote.stockName}
        tickerCode={stockCode}
        currentPrice={quote.currentPrice}
        cash={cash ?? 0}
        holdingQuantity={holding?.holdingQuantity ?? 0}
        onClose={() => setOrderSide(null)}
        onConfirm={(params) => {
          setPendingOrder({ ...params, side: orderSide! });
          setOrderSide(null);
        }}
      />
    )}

    {pendingOrder && (
      <TradeConfirmModal
        side={pendingOrder.side}
        stockName={quote?.stockName ?? ""}
        orderType={pendingOrder.orderType}
        price={pendingOrder.price}
        quantity={pendingOrder.quantity}
        totalAmount={pendingOrder.price * pendingOrder.quantity}
        onClose={() => setPendingOrder(null)}
        onConfirm={() => {
          if (!pendingOrder) return;
          const body = {
            ticker: stockCode,
            orderType: pendingOrder.orderType,
            price: pendingOrder.price,
            quantity: pendingOrder.quantity,
            diary: pendingOrder.diary,
          };
          const mutation = pendingOrder.side === "buy" ? buyMutation : sellMutation;
          mutation.mutate(body, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: stockQueryKeys.holding(stockCode) });
              queryClient.invalidateQueries({ queryKey: stockQueryKeys.cash });
              setPendingOrder(null);
            },
          });
        }}
      />
    )}
    </>
  );
}
