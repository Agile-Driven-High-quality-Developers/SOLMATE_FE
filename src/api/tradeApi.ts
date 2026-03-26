import { useQuery } from "@tanstack/react-query";
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

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tradeQueryKeys = {
  history: ["trade", "history"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

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
