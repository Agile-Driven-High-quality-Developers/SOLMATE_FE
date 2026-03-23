import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockItem = {
  code: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  changeRate: string;
  isPositive: boolean;
  volume: string;
  marketCap: string;
  isHolding: boolean;
  color: string;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const stockQueryKeys = {
  stocks: ["stocks"] as const,
};

// ─── React Query Hooks ────────────────────────────────────────────────────────

export function useStocksQuery() {
  return useQuery({
    queryKey: stockQueryKeys.stocks,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<StockItem[]>>("/api/stocks")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}
