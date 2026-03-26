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

// ─── Fetch Functions ──────────────────────────────────────────────────────────

export function fetchAccountSummary(): Promise<AccountSummaryData> {
  return fetchClient
    .get<ApiResponse<AccountSummaryData>>("/api/account/summary")
    .then((res) => res.data);
}

export function fetchAccountSummaryByUser(userId: number): Promise<AccountSummaryData> {
  return fetchClient
    .get<ApiResponse<AccountSummaryData>>(`/api/account/summary/${userId}`)
    .then((res) => res.data);
}

// ─── React Query Hook ─────────────────────────────────────────────────────────

export function useAccountSummaryQuery() {
  return useQuery({
    queryKey: accountSummaryQueryKeys.summary,
    queryFn: fetchAccountSummary,
    staleTime: 0,
    refetchInterval: 10_000,
  });
}

export function useAccountSummaryByUserQuery(userId: number) {
  return useQuery({
    queryKey: ["account-summary", userId],
    queryFn: () => fetchAccountSummaryByUser(userId),
    refetchInterval: 60_000,
  });
}
