import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BarChart2, ClipboardList, Wallet, BookOpen } from "lucide-react";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const STOCK_DETAIL_TOUR: TourStep[] = [
  {
    target: "stock-chart",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <BarChart2 size={15} />
        주가 차트
      </span>
    ),
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
    title: (
      <span className="inline-flex items-center gap-1.5">
        <ClipboardList size={15} />
        오늘의 주가 정보
      </span>
    ),
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
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Wallet size={15} />
        보유현황 & 매수·매도
      </span>
    ),
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
    title: (
      <span className="inline-flex items-center gap-1.5">
        <BookOpen size={15} />
        호가창
      </span>
    ),
    description:
      "지금 이 주식을 사거나 팔려는 사람들이 원하는 가격 목록이에요. 가격을 누르면 바로 그 가격으로 주문창이 열려요.",
    items: [
      {
        label: "매도호가 (위쪽 · 파란 잔량)",
        labelColor: "#3B82F6",
        text: "— 팔겠다고 대기 중인 가격. 내가 매수할 때 이 가격에 맞춰 체결돼요",
      },
      {
        label: "매수호가 (아래쪽 · 빨간 잔량)",
        labelColor: "#EF4444",
        text: "— 사겠다고 대기 중인 가격. 내가 매도할 때 이 가격에 맞춰 체결돼요",
      },
      "테두리 강조 행 — 현재 시세(기준가)",
      "오른쪽 숫자(잔량) — 대기 중인 주문 수량. 막대 길이로도 한눈에 비교할 수 있어요",
    ],
    placement: "left",
  },
];
import { Loader2 } from "lucide-react";
import { stompSubscribe } from "@/lib/stompClient";
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
  StockTradeOrder,
  StockTradeHistory,
} from "@/api/stockApi";
import { useUser } from "@/store/authStore";

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
  const queryClient = useQueryClient();
  const user = useUser();
  const [orderSide, setOrderSide] = useState<OrderSide | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "history">("info");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3500);
  };

  const buyMutation = useBuyOrderMutation();
  const sellMutation = useSellOrderMutation();

  const { data: quote, isLoading } = useStockQuoteQuery(stockCode);
  const { data: holding } = useStockHoldingQuery(stockCode);
  const { data: cash } = useCashBalanceQuery();
  const { data: tradeHistory } = useStockTradeHistoryQuery(stockCode);
  const { data: orderBook } = useOrderBookQuery(stockCode);

  useEffect(() => {
    if (!stockCode) return;

    const unsubQuote = stompSubscribe(`/topic/stocks/${stockCode}/quote`, (message) => {
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

    const unsubOrderBook = stompSubscribe(`/topic/orderbook/${stockCode}`, (message) => {
      const raw = JSON.parse(message.body);
      console.log("[STOMP] 호가 원본:", JSON.stringify(raw));
      const msg: OrderBookData = raw.data ?? raw;
      queryClient.setQueryData<OrderBookData>(
        stockQueryKeys.orderBook(stockCode),
        msg,
      );
    });

    let unsubTrades: (() => void) | undefined;
    if (user?.userId) {
      unsubTrades = stompSubscribe(`/topic/trades/${user.userId}`, (message) => {
        const order: StockTradeOrder = JSON.parse(message.body);
        queryClient.setQueryData<StockTradeHistory>(
          stockQueryKeys.tradeHistory(stockCode),
          (prev) => {
            if (!prev) return prev;
            const exists = prev.orders.some((o) => o.orderId === order.orderId);
            return {
              ...prev,
              orders: exists
                ? prev.orders.map((o) => o.orderId === order.orderId ? order : o)
                : [order, ...prev.orders],
            };
          },
        );
      });
    }

    return () => {
      unsubQuote();
      unsubOrderBook();
      if (unsubTrades) unsubTrades();
    };
  }, [stockCode, queryClient, user?.userId]);

  useEffect(() => {
    if (!quote) return;
    const rate = quote.changeRate;
    document.title = `${quote.currentPrice.toLocaleString()}원 ${rate > 0 ? "+" : ""}${rate.toFixed(2)}% | ${quote.stockName}`;
    return () => {
      document.title = "SOLMATE";
    };
  }, [quote]);

  useEffect(() => {
    if (!quote?.stockLogo) return;
    const setFavicon = (href: string) => {
      const existing = document.querySelector("link[rel='icon']");
      if (existing) existing.remove();
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = href;
      document.head.appendChild(link);
    };
    setFavicon(quote.stockLogo);
    return () => {
      setFavicon("/solmate_logo.png");
    };
  }, [quote?.stockLogo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50 dark:bg-slate-950">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50 dark:bg-slate-950 text-[14px] text-gray-400 dark:text-slate-500">
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
      <div className="flex flex-col p-4 md:p-6 gap-5 overflow-auto bg-gray-50 dark:bg-slate-950 min-h-screen">
        <StockDetailHeader stock={headerStock} />

        {isMobile ? (
          /* ── 모바일 레이아웃 ── */
          <div className="flex flex-col gap-5">
            <div data-tour="stock-chart">
              <StockChart stockCode={stockCode} />
            </div>

            {orderBook && (
              <div data-tour="stock-orderbook">
                <OrderBook
                  orderBook={orderBook}
                  holdingQuantity={holding?.holdingQuantity ?? 0}
                  onPriceClick={(price, side) => {
                    setSelectedPrice(price);
                    setOrderSide(side);
                  }}
                />
              </div>
            )}

            <div data-tour="stock-holding">
              <HoldingStatus
                holding={holding}
                cash={cash}
                onBuy={() => setOrderSide("buy")}
                onSell={() => setOrderSide("sell")}
              />
            </div>

            {/* 탭: 종목정보 / 거래내역 */}
            <div>
              <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${
                    activeTab === "info"
                      ? "text-[#0046FF] border-b-2 border-[#0046FF]"
                      : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  종목정보
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${
                    activeTab === "history"
                      ? "text-[#0046FF] border-b-2 border-[#0046FF]"
                      : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  거래내역
                </button>
              </div>
              {activeTab === "info" && (
                <div data-tour="stock-info">
                  <StockInfoGrid quote={quote} />
                </div>
              )}
              {activeTab === "history" && (
                <TradeHistory
                  tickerCode={stockCode}
                  orders={tradeHistory?.orders ?? []}
                />
              )}
            </div>
          </div>
        ) : (
          /* ── 데스크탑 레이아웃 ── */
          <div className="flex flex-row gap-5 items-start">
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
                  <OrderBook
                    orderBook={orderBook}
                    holdingQuantity={holding?.holdingQuantity ?? 0}
                    onPriceClick={(price, side) => {
                      setSelectedPrice(price);
                      setOrderSide(side);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {orderSide && (
        <TradeOrderModal
          side={orderSide}
          stockName={quote.stockName}
          tickerCode={stockCode}
          currentPrice={quote.currentPrice}
          initialPrice={selectedPrice ?? undefined}
          cash={cash ?? 0}
          holdingQuantity={holding?.holdingQuantity ?? 0}
          onClose={() => {
            setOrderSide(null);
            setSelectedPrice(null);
          }}
          onConfirm={(params) => {
            setPendingOrder({ ...params, side: orderSide! });
            setOrderSide(null);
            setSelectedPrice(null);
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
              onError: (err: unknown) => {
                setPendingOrder(null);
                const code = (err as { data?: { code?: string } })?.data?.code;
                if (code === "INSUFFICIENT_CASH") {
                  showErrorToast("잔액이 부족합니다. 주문 금액을 확인해 주세요.");
                } else if (code === "INSUFFICIENT_HOLDINGS") {
                  showErrorToast("보유 수량이 부족합니다. 주문 수량을 확인해 주세요.");
                } else {
                  showErrorToast("주문에 실패했습니다. 다시 시도해 주세요.");
                }
              },
            });
          }}
        />
      )}
      <SpotlightTour tourKey="stock-detail" steps={STOCK_DETAIL_TOUR} hidden={!!orderSide || !!pendingOrder} />

      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-red-500 text-white text-[13px] font-semibold px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          <span>⚠️</span>
          {errorToast}
        </div>
      )}
    </>
  );
}
