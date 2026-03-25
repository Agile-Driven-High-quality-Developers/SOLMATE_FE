import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HoldingsRatioItem = {
  tickerCode: string;
  stockName: string;
  evaluation: number;
  ratio: number;
};

export type AccountSummary = {
  totalAsset: number;
  totalAssetChangeAmount: number;
  totalAssetChangeRate: number;
  cash: number;
  initialCash: number;
  holdingsCount: number;
  totalEvaluation: number;
  totalReturnRate: number;
  totalReturnAmount: number;
  holdingsRatio: HoldingsRatioItem[];
};

export type HoldingItem = {
  tickerCode: string;
  stockName: string;
  stockLogo: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  evaluation: number;
  returnRate: number;
  returnAmount: number;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const accountQueryKeys = {
  summary: ["account", "summary"] as const,
  holdings: ["account", "holdings"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAccountSummaryQuery() {
  return useQuery({
    queryKey: accountQueryKeys.summary,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<AccountSummary>>("/api/account/summary")
        .then((res) => res.data),
    staleTime: 10_000,
  });
}

export function useHoldingsQuery() {
  return useQuery({
    queryKey: accountQueryKeys.holdings,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<HoldingItem[]>>("/api/holdings")
        .then((res) => res.data),
    staleTime: 10_000,
  });
}
