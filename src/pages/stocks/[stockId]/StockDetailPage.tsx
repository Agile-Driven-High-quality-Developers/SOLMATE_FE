import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const STOCK_DETAIL_TOUR: TourStep[] = [
  {
    target: "stock-chart",
    title: "📊 주가 차트",
    description: "주가가 시간에 따라 어떻게 변했는지 보여줘요.",
    items: [
      "빨간 캔들 — 어제보다 오른 날",
      "파란 캔들 — 어제보다 내린 날",
      "오른쪽으로 갈수록 최근 데이터예요",
    ],
    placement: "bottom",
  },
  {
    target: "stock-info",
    title: "📋 오늘의 주가 정보",
    description: "오늘 하루 동안의 주요 가격이에요.",
    items: [
      "시가 — 오늘 장이 열릴 때 첫 거래 가격",
      "고가 — 오늘 중 가장 높았던 가격",
      "저가 — 오늘 중 가장 낮았던 가격",
      "전일종가 — 어제 마감 가격",
    ],
    placement: "bottom",
  },
  {
    target: "stock-holding",
    title: "💳 보유현황 & 매수·매도",
    description: "내 주식 현황과 주문 버튼이에요.",
    items: [
      "매수 — 주식 사기 (예수금이 줄어요)",
      "매도 — 주식 팔기 (예수금이 늘어요)",
      "예수금 범위 안에서만 매수할 수 있어요",
    ],
    placement: "left",
  },
  {
    target: "stock-orderbook",
    title: "📚 호가창",
    description: "사려는 사람과 팔려는 사람의 희망 가격이에요.",
    items: [
      {
        label: "매도호가",
        labelColor: "#EF4444",
        text: "— 팔고 싶은 사람들의 희망 가격 (빨간색)",
      },
      {
        label: "매수호가",
        labelColor: "#3B82F6",
        text: "— 사고 싶은 사람들의 희망 가격 (파란색)",
      },
      "옆 숫자(잔량) — 그 가격에 대기 중인 주문 수량이에요. 숫자가 클수록 그 가격에 사람이 많아요",
      "호가와 내 주문가격이 맞을 때 주문이 체결돼요",
    ],
    placement: "left",
  },
];
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
import type {
  StockQuote,
  StockItemMessage,
  OrderBookData,
} from "@/api/stockApi";

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
      setFavicon("/solmate_logo.png");
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
    sectorType: quote.sectorType,
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
            <div data-tour="stock-chart">
              <StockChart stockCode={stockCode} />
            </div>

            <div data-tour="stock-info">
              <StockInfoGrid quote={quote} />
            </div>

            <TradeHistory
              tickerCode={stockCode}
              orders={tradeHistory?.orders ?? []}
            />
          </div>

          {/* 오른쪽 */}
          <div className="w-60 shrink-0 flex flex-col gap-4">
            <div data-tour="stock-holding">
              <HoldingStatus
                holding={holding}
                cash={cash}
                onBuy={() => setOrderSide("buy")}
                onSell={() => setOrderSide("sell")}
              />
            </div>
            {orderBook && (
              <div data-tour="stock-orderbook">
                <OrderBook orderBook={orderBook} />
              </div>
            )}
          </div>
        </div>
      </div>

      {orderSide && (
        <TradeOrderModal
          side={orderSide}
          stockName={quote.stockName}
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
            const mutation =
              pendingOrder.side === "buy" ? buyMutation : sellMutation;
            mutation.mutate(body, {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: stockQueryKeys.holding(stockCode),
                });
                queryClient.invalidateQueries({
                  queryKey: stockQueryKeys.cash,
                });
                setPendingOrder(null);
              },
            });
          }}
        />
      )}
      <SpotlightTour tourKey="stock-detail" steps={STOCK_DETAIL_TOUR} />
    </>
  );
}
