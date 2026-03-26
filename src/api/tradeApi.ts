import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TradeHistoryItem = {
  tickerCode: string;
  stockName: string;
  stockLogo: string;
  tradeType: "BUY" | "SELL";
  tradeTypeLabel: string;
  quantity: number;
  price: number;
  amount: number;
  profitAmount: number | null;
  profitRate: number | null;
  tradedAt: string;
};

export type OrderRequest = {
  ticker: string;
  orderType: "MARKET" | "LIMIT";
  price: number;
  quantity: number;
  diary: string;
};

export type OrderResponse = {
  orderId: number;
  ticker: string;
  orderType: string;
  tradeType: string;
  price: number;
  quantity: number;
  status: string;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tradeQueryKeys = {
  history: ["trade", "history"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useBuyOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderRequest) =>
      fetchClient
        .post<ApiResponse<OrderResponse>>("/api/trades/buy", body)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.history });
    },
  });
}

export function useSellOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderRequest) =>
      fetchClient
        .post<ApiResponse<OrderResponse>>("/api/trades/sell", body)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.history });
    },
  });
}

export function useTradeHistoryQuery() {
  return useQuery({
    queryKey: tradeQueryKeys.history,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<TradeHistoryItem[]>>("/api/trades/history")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}
