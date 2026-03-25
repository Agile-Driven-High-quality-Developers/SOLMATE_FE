import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

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
        .then((res) =>
          res.data.map((s) => ({ ...s, stockLogo: toLogoUrl(s.stockLogo) })),
        ),
    staleTime: 30_000,
  });
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL ?? "";

function toLogoUrl(logo: string): string {
  if (!logo || logo.startsWith("http")) return logo;
  return `${S3_BASE_URL}/${logo}`;
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
