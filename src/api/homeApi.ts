import axios from "axios";
import type { ApiResponse } from "./authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarketIndexData = {
  label: string;      // "KOSPI" | "KOSDAQ" | "USD/KRW"
  value: string;      // "2,648.73"
  change: string;     // "19.43"
  changePercent: string; // "0.70"
  isPositive: boolean;
};

export type PortfolioData = {
  totalValue: string;        // "1,125만 원"
  totalReturn: string;       // "+125만원"
  totalReturnPercent: string; // "+12.50%"
  principal: string;         // "1,000만원"
  purchaseAmount: string;    // "214만원"
  holdingCount: number;      // 6
};

export type HoldingStockData = {
  name: string;        // "삼성전자"
  quantity: number;    // 15
  evalAmount: string;  // "110만원"
  evalProfit: string;  // "+7.8만원"
  returnRate: string;  // "+7.62%"
  isPositive: boolean;
  color: string;       // avatar 색상 (없으면 기본값 사용)
};

export type TopInvestorData = {
  rank: number;
  name: string;
  returnRate: string;  // "+48.3%"
  color: string;       // avatar 색상
};

export type PopularStockData = {
  rank: number;
  name: string;
  price: string;         // "73,400"
  changePercent: string; // "+1.24%"
  isPositive: boolean;
  color: string;         // avatar 색상
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const homeApi = {
  /** GET /api/... — 시장 지수 (KOSPI, KOSDAQ, USD/KRW) */
  getMarketIndices: () =>
    api.get<ApiResponse<MarketIndexData[]>>("/api/TODO/market-indices"),

  /** GET /api/... — 내 포트폴리오 요약 */
  getPortfolio: () =>
    api.get<ApiResponse<PortfolioData>>("/api/TODO/portfolio"),

  /** GET /api/... — 보유 종목 목록 */
  getHoldings: () =>
    api.get<ApiResponse<HoldingStockData[]>>("/api/TODO/holdings"),

  /** GET /api/... — TOP 투자자 */
  getTopInvestors: () =>
    api.get<ApiResponse<TopInvestorData[]>>("/api/TODO/top-investors"),

  /** GET /api/... — 인기 종목 */
  getPopularStocks: () =>
    api.get<ApiResponse<PopularStockData[]>>("/api/TODO/popular-stocks"),
};
