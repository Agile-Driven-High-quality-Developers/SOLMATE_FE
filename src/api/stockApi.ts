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
};

export type StockItemMessage = {
  data: {
    tickerCode: string;
    stockName: string;
    stockLogo: string;
    sectorType: string;
    currentPrice: number;
    changeRate: number;
  };
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
        .then((res) => res.data.map((s) => ({ ...s, stockLogo: toLogoUrl(s.stockLogo) }))),
    staleTime: 30_000,
  });
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL ?? "";

function toLogoUrl(logo: string): string {
  if (!logo || logo.startsWith("http")) return logo;
  return `${S3_BASE_URL}/${logo}`;
}

export function parseStockItemMessage(msg: StockItemMessage): StockItem {
  const { tickerCode, stockName, stockLogo, sectorType, currentPrice, changeRate } = msg.data;
  return { tickerCode, stockName, stockLogo: toLogoUrl(stockLogo), sectorType, currentPrice, changeRate };
}
