import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { fetchClient } from "@/lib/fetchClient";
import { stompSubscribe } from "@/lib/stompClient";
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

export function useRealtimeHoldings() {
  const { data: holdingsRaw = [], ...rest } = useHoldingsQuery();
  const [realtimePrices, setRealtimePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const active = holdingsRaw.filter((h) => h.quantity > 0);
    if (active.length === 0) return;

    const unsubs = active.map((h) =>
      stompSubscribe(`/topic/stocks/${h.tickerCode}/quote`, (message) => {
        const msg = JSON.parse(message.body);
        setRealtimePrices((prev) => ({ ...prev, [h.tickerCode]: msg.currentPrice }));
      }),
    );

    return () => unsubs.forEach((u) => u());
  }, [holdingsRaw]);

  const holdings = useMemo(() =>
    holdingsRaw.filter((h) => h.quantity > 0).map((h) => {
      const currentPrice = realtimePrices[h.tickerCode] ?? h.currentPrice;
      const evaluation = currentPrice * h.quantity;
      const returnAmount = (currentPrice - h.avgPrice) * h.quantity;
      const returnRate = h.avgPrice > 0 ? ((currentPrice - h.avgPrice) / h.avgPrice) * 100 : 0;
      return { ...h, currentPrice, evaluation, returnAmount, returnRate };
    }),
  [holdingsRaw, realtimePrices]);

  return { holdings, ...rest };
}
