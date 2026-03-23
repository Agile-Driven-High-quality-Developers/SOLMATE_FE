import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";

// ─── Raw Types (백엔드 응답 원본) ──────────────────────────────────────────────

type MarketIndexRaw = {
  cur: string;
  change: string;
  rate: string;
  sign: string; // "1"|"2" = 상승, "3" = 보합, "4"|"5" = 하락
  high: string;
  low: string;
  asOf: string;
};

type MarketIndicesResponse = {
  kospi: MarketIndexRaw | null;
  kosdaq: MarketIndexRaw | null;
  usdKrw: MarketIndexRaw | null;
};

// ─── Component Types ──────────────────────────────────────────────────────────

export type MarketIndexData = {
  label: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  high: string;
  low: string;
};

export type PortfolioData = {
  totalValue: string;
  totalReturn: string;
  totalReturnPercent: string;
  principal: string;
  purchaseAmount: string;
  holdingCount: number;
};

export type HoldingStockData = {
  name: string;
  quantity: number;
  evalAmount: string;
  evalProfit: string;
  returnRate: string;
  isPositive: boolean;
  color: string;
};

export type TopInvestorData = {
  rank: number;
  name: string;
  returnRate: string;
  color: string;
};

export type PopularStockData = {
  rank: number;
  name: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
  color: string;
};

// ─── STOMP Message Type ────────────────────────────────────────────────────────

export type MarketIndicatorMessage = {
  data: {
    type: "KOSPI" | "KOSDAQ" | "USD_KRW";
    current: string;
    change: string;
    changeRate: string;
    sign: string;
    high: string;
    low: string;
    asOf: string;
  };
};

// ─── Parsers ──────────────────────────────────────────────────────────────────

function toMarketIndexData(
  label: string,
  raw: MarketIndexRaw,
): MarketIndexData {
  return {
    label,
    value: raw.cur,
    change: raw.change,
    changePercent: raw.rate,
    isPositive: raw.sign === "1" || raw.sign === "2",
    high: raw.high,
    low: raw.low,
  };
}

export function parseMarketIndices(
  res: MarketIndicesResponse,
): MarketIndexData[] {
  return (
    [
      ["KOSPI", res.kospi],
      ["KOSDAQ", res.kosdaq],
      ["USD/KRW", res.usdKrw],
    ] as [string, MarketIndexRaw | null][]
  )
    .filter(([, raw]) => raw != null)
    .map(([label, raw]) => toMarketIndexData(label, raw!));
}

const TYPE_TO_LABEL: Record<string, string> = {
  KOSPI: "KOSPI",
  KOSDAQ: "KOSDAQ",
  USD_KRW: "USD/KRW",
};

export function parseMarketIndicatorMessage(
  msg: MarketIndicatorMessage,
): MarketIndexData {
  const { type, current, change, changeRate, sign, high, low } = msg.data;
  return {
    label: TYPE_TO_LABEL[type] ?? type,
    value: current,
    change,
    changePercent: changeRate,
    isPositive: sign === "1" || sign === "2",
    high,
    low,
  };
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const homeQueryKeys = {
  marketIndices: ["market-indices"] as const,
};

// ─── React Query Hooks ────────────────────────────────────────────────────────

export function useMarketIndicesQuery() {
  return useQuery({
    queryKey: homeQueryKeys.marketIndices,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MarketIndicesResponse>>(
          "/api/market/market-indicators",
        )
        .then((res) => {
          console.log("[market] response:", res);
          return parseMarketIndices(res.data);
        })
        .catch((err) => {
          console.error("[market] error:", err);
          throw err;
        }),
    staleTime: 10_000,
  });
}
