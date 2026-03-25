import { fetchClient } from "@/lib/fetchClient";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "./authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HoldingRatio = {
  tickerCode: string;
  stockName: string;
  evaluation: number;
  ratio: number;
};

export type AccountSummaryData = {
  totalAsset: number;
  totalAssetChangeAmount: number;
  totalAssetChangeRate: number;
  cash: number;
  initialCash: number;
  holdingsCount: number;
  totalEvaluation: number;
  totalReturnRate: number;
  totalReturnAmount: number;
  holdingsRatio: HoldingRatio[];
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const accountSummaryQueryKeys = {
  summary: ["account-summary"] as const,
};

// ─── React Query Hook ─────────────────────────────────────────────────────────

export function useAccountSummaryQuery() {
  return useQuery({
    queryKey: accountSummaryQueryKeys.summary,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<AccountSummaryData>>("/api/account/summary")
        .then((res) => res.data),
    staleTime: 0,
    refetchInterval: 10_000,
  });
}
