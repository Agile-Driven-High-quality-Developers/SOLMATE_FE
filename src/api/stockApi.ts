import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";
import { accountQueryKeys } from "./accountApi";

// ─── Types: 종목 목록 ─────────────────────────────────────────────────────────

export type StockItem = {
  tickerCode: string;
  stockName: string;
  stockLogo: string;
  sectorType: string;
  currentPrice: number;
  changeRate: number;
  total: number;
  volume: number;
};

export type StockItemMessage = {
  stockCode: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  chetime: string;
};

// ─── Types: 종목 현재가/상세 (GET /api/stocks/{stockCode}/quote) ───────────────

export type StockQuote = {
  stockCode: string;
  stockName: string;
  stockLogo: string;
  sectorType: string;
  currentPrice: number;
  changePrice: number; // 전일 대비
  changeRate: number; // 등락률 (%)
  previousClosePrice: number; // 전일종가
  openPrice: number; // 시가
  highPrice: number; // 고가
  lowPrice: number; // 저가
  volume: number; // 거래량
  total: number; // 시가총액
};

/** 상세 헤더 등 UI용 — `StockQuote` 등에서 매핑 */
export type StockDetail = {
  tickerCode: string;
  stockName: string;
  stockLogo: string;
  sectorType: string;
  currentPrice: number;
  change: number;
  changeRate: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  marketCap: number;
};

// ─── Types: 종목 보유현황 (GET /api/stocks/{stockCode}/holding) ───────────────

export type StockHolding = {
  holdingQuantity: number;
  availableSellQuantity: number;
  averageBuyPrice: number;
  evaluationAmount: number;
  profitAmount: number;
  profitRate: number;
};

// ─── Types: 호가 (GET /api/stocks/{stockCode}/orderbook) ─────────────────────

export type OrderBookEntry = {
  price: number;
  quantity: number;
};

export type OrderBookData = {
  stockCode: string;
  currentPrice: number;
  changeRate: number;
  sellLevels: OrderBookEntry[]; // 매도호가 (파랑, 위) — 높은 가격순
  buyLevels: OrderBookEntry[]; // 매수호가 (빨강, 아래) — 높은 가격순
  timestamp: string;
};

// ─── Types: 종목별 거래내역 (GET /api/trades/{tickerCode}) ────────────────────

export type StockTradeOrder = {
  orderId: number;
  side: "BUY" | "SELL";
  sideLabel: string;
  orderType: "MARKET" | "LIMIT";
  orderTypeLabel: string;
  orderPrice: number;
  quantity: number;
  orderAmount: number;
  status: string;
  statusLabel: string;
  cancelable: boolean;
};

export type StockTradeHistory = {
  stockCode: string;
  stockName: string;
  orders: StockTradeOrder[];
};

// ─── Types: 매수/매도 주문 (POST /api/trades/buy|sell) ───────────────────────

export type TradeOrderRequest = {
  ticker: string;
  orderType: "MARKET" | "LIMIT";
  price?: number;
  quantity: number;
  diary?: string;
};

export type TradeOrderResponse = {
  orderId: number;
  ticker: string;
  orderType: string;
  tradeType: string;
  price: number;
  quantity: number;
  status: string;
};

const SIDE_LABEL: Record<string, string> = { BUY: "매수", SELL: "매도" };
const ORDER_TYPE_LABEL: Record<string, string> = { MARKET: "시장가", LIMIT: "지정가" };
const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  FILLED: "체결",
  CANCELLED: "취소",
};

export function mapTradeOrderResponseToStockTradeOrder(
  res: TradeOrderResponse,
): StockTradeOrder {
  return {
    orderId: res.orderId,
    side: res.tradeType as "BUY" | "SELL",
    sideLabel: SIDE_LABEL[res.tradeType] ?? res.tradeType,
    orderType: res.orderType as "MARKET" | "LIMIT",
    orderTypeLabel: ORDER_TYPE_LABEL[res.orderType] ?? res.orderType,
    orderPrice: res.price,
    quantity: res.quantity,
    orderAmount: res.price * res.quantity,
    status: res.status,
    statusLabel: STATUS_LABEL[res.status] ?? res.status,
    cancelable: res.status === "PENDING",
  };
}

// ─── Types: 캔들 데이터 ───────────────────────────────────────────────────────

export type CandleData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PeriodType =
  | "1"
  | "5"
  | "30"
  | "60"
  | "day"
  | "week"
  | "month"
  | "year";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const stockQueryKeys = {
  stocks: ["stocks"] as const,
  quote: (code: string) => ["stocks", code, "quote"] as const,
  holding: (code: string) => ["stocks", code, "holding"] as const,
  orderBook: (code: string) => ["stocks", code, "orderbook"] as const,
  tradeHistory: (code: string) => ["trades", code] as const,
  cash: ["holdings", "cash"] as const,
  candles: (code: string, period: string) =>
    ["stocks", code, "candles", period] as const,
};

// ─── React Query Hooks ────────────────────────────────────────────────────────

export function useStocksQuery() {
  return useQuery({
    queryKey: stockQueryKeys.stocks,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<StockItem[]>>("/api/stocks")
        .then((res) =>
          res.data.map((s) => ({ ...s, stockLogo: toLogoUrl(s.stockLogo) })),
        ),
    staleTime: 30_000,
  });
}

export function useStockQuoteQuery(stockCode: string) {
  return useQuery({
    queryKey: stockQueryKeys.quote(stockCode),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<StockQuote>>(`/api/stocks/${stockCode}/quote`)
        .then((res) => res.data),
    staleTime: 5_000,
    enabled: !!stockCode,
  });
}

export function useStockHoldingQuery(stockCode: string) {
  return useQuery({
    queryKey: stockQueryKeys.holding(stockCode),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<StockHolding>>(`/api/stocks/${stockCode}/holding`)
        .then((res) => res.data),
    staleTime: 10_000,
    enabled: !!stockCode,
  });
}

export function useCashBalanceQuery() {
  return useQuery({
    queryKey: stockQueryKeys.cash,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<number>>("/api/holdings/cash")
        .then((res) => res.data),
    staleTime: 10_000,
  });
}

export function useOrderBookQuery(stockCode: string) {
  return useQuery({
    queryKey: stockQueryKeys.orderBook(stockCode),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<OrderBookData>>(`/api/stocks/${stockCode}/orderbook`)
        .then((res) => res.data),
    staleTime: 60_000,
    enabled: !!stockCode,
  });
}

export function useStockTradeHistoryQuery(tickerCode: string) {
  return useQuery({
    queryKey: stockQueryKeys.tradeHistory(tickerCode),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<StockTradeHistory>>(`/api/trades/${tickerCode}`)
        .then((res) => res.data),
    staleTime: 5_000,
    enabled: !!tickerCode,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useBuyOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TradeOrderRequest) =>
      fetchClient
        .post<ApiResponse<TradeOrderResponse>>("/api/trades/buy", body)
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.tradeHistory(variables.ticker),
      });
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.holding(variables.ticker),
      });
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.cash });
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary });
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.holdings });
    },
  });
}

export function useSellOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TradeOrderRequest) =>
      fetchClient
        .post<ApiResponse<TradeOrderResponse>>("/api/trades/sell", body)
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.tradeHistory(variables.ticker),
      });
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.holding(variables.ticker),
      });
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.cash });
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary });
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.holdings });
    },
  });
}

export function useCancelOrderMutation(tickerCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      fetchClient.patch<ApiResponse<void>>(
        `/api/orders/${orderId}/cancel`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.tradeHistory(tickerCode),
      });
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// ─── API ──────────────────────────────────────────────────────────────────────

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL ?? "";

function toLogoUrl(logo: string): string {
  if (!logo || logo.startsWith("http")) return logo;
  return `${S3_BASE_URL}/${logo}`;
}

export async function fetchStocks(): Promise<StockItem[]> {
  const res = await fetchClient.get<ApiResponse<StockItem[]>>("/api/stocks");
  return res.data.map((s) => ({ ...s, stockLogo: toLogoUrl(s.stockLogo) }));
}

export function useCandleQuery(stockCode: string, period: PeriodType, limit = 365) {
  const url = (() => {
    if (period === "1" || period === "5" || period === "30" || period === "60") {
      return `/api/stocks/${stockCode}/candles/minute?unit=${period}`;
    }
    if (period === "day") return `/api/stocks/${stockCode}/candles/daily?days=${limit}`;
    if (period === "week") return `/api/stocks/${stockCode}/candles/weekly?weeks=${Math.ceil(limit / 7)}`;
    if (period === "month") return `/api/stocks/${stockCode}/candles/monthly?months=${Math.ceil(limit / 30)}`;
    return `/api/stocks/${stockCode}/candles/yearly?years=${Math.ceil(limit / 365)}`;
  })();

  return useQuery({
    queryKey: [...stockQueryKeys.candles(stockCode, period), limit],
    queryFn: () =>
      fetchClient
        .get<ApiResponse<CandleData[]>>(url)
        .then((res) => res.data),
    staleTime: period === "1" ? 30_000 : 60_000,
    enabled: !!stockCode,
  });
}

export function parseStockItemMessage(msg: StockItemMessage): {
  tickerCode: string;
  currentPrice: number;
  changeRate: number;
  volume: number;
} {
  const { stockCode, currentPrice, changeRate, volume } = msg;
  return {
    tickerCode: stockCode,
    currentPrice,
    changeRate,
    volume,
  };
}
