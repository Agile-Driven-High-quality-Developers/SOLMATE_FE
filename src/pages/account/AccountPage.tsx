import { useState, useEffect } from "react";
import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import {
  Wallet,
  Landmark,
  Package,
  TrendingUp,
  PieChart,
  ClipboardList,
} from "lucide-react";
import { useAccountSummaryQuery, useHoldingsQuery } from "@/api/accountApi";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const ACCOUNT_TOUR: TourStep[] = [
  {
    target: "account-total",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Wallet size={15} />총 자산
      </span>
    ),
    description: "예수금과 보유 주식의 현재 가치를 더한 내 전체 자산이에요.",
    items: [
      "큰 숫자 — 지금 내 자산이 얼마인지 보여줘요",
      "아래 수치 — 원금 대비 얼마나 변했는지 보여줘요",
    ],
    placement: "bottom",
  },
  {
    target: "account-cash",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Landmark size={15} />
        주문 가능 금액
      </span>
    ),
    description: "지금 바로 주식 주문에 사용할 수 있는 금액이에요.",
    placement: "bottom",
  },
  {
    target: "account-holdings-count",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Package size={15} />
        보유 종목 수
      </span>
    ),
    description:
      "현재 보유 중인 종목 수와 해당 종목들의 총 평가금액을 함께 보여줘요.",
    placement: "bottom",
  },
  {
    target: "account-return",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <TrendingUp size={15} />총 수익률
      </span>
    ),
    description:
      "처음 받은 투자금이 지금 얼마나 변했는지 퍼센트와 금액으로 보여줘요. 빨간색은 수익, 파란색은 손실을 뜻해요.",
    placement: "bottom",
  },
  {
    target: "account-chart",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <PieChart size={15} />
        종목 비중
      </span>
    ),
    description:
      "보유 중인 각 종목이 내 보유 종목 내에서 차지하는 비중을 보여줘요.",
    placement: "right",
  },
  {
    target: "account-holdings-table",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <ClipboardList size={15} />
        보유 종목 목록
      </span>
    ),
    description: "현재 보유 중인 종목의 정보를 보여줘요.",
    items: [
      "평균단가 — 내가 산 평균 가격",
      "현재가 — 지금 시장에서 거래되는 가격",
      "평가금액 — 보유 수량을 현재가로 계산한 금액",
      "수익률 — 각 종목의 수익 또는 손실 비율",
    ],
    placement: "top",
  },
];

function fmt(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function AccountPage() {
  const { data: summary } = useAccountSummaryQuery();
  const { data: holdingsRaw = [] } = useHoldingsQuery();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const holdings = holdingsRaw
    .filter((h) => h.quantity > 0)
    .map((h) => ({
      tickerCode: h.tickerCode,
      stockName: h.stockName,
      stockLogo: h.stockLogo,
      quantity: h.quantity,
      averageBuyPrice: h.avgPrice,
      currentPrice: h.currentPrice,
      evaluationAmount: h.evaluation,
      profitRate: h.returnRate,
      profitAmount: h.returnAmount,
    }));

  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  return (
    <div className="flex flex-col h-full p-4 md:p-6 gap-4 md:gap-5 overflow-auto bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div>
        <h1 className="text-[20px] md:text-[22px] font-semibold text-gray-900 dark:text-gray-100">
          내 계좌
        </h1>
        <p className="text-[12px] md:text-[12px] text-gray-400 dark:text-slate-500 mt-0.5">
          나의 투자 현황을 한눈에 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3 md:gap-4 items-stretch">
        {/* 보유 총 자산 */}
        <div
          className="col-span-3 md:col-span-1 bg-[#0046FF] rounded-2xl px-4 md:px-6 py-4 md:py-5 text-white"
          data-tour="account-total"
        >
          <p className="text-[12px] md:text-[12px] font-medium opacity-80 mb-1 md:mb-2">
            보유 총 자산
          </p>
          <p className="text-[22px] md:text-[28px] font-semibold">
            {fmt(summary?.totalAsset ?? 0)}
          </p>
          <p
            className={`text-[11px] md:text-[12px] font-medium mt-1 ${isPositive ? "text-red-300" : "text-blue-200"}`}
          >
            {isPositive ? "+" : ""}
            {fmt(summary?.totalReturnAmount ?? 0)} ({isPositive ? "+" : ""}
            {(summary?.totalReturnRate ?? 0).toFixed(2)}%)
          </p>
        </div>

        {/* 주문 가능 금액 */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-3 md:px-6 py-3 md:py-5"
          data-tour="account-cash"
        >
          <p className="text-[10px] md:text-[12px] text-gray-400 dark:text-slate-500 font-medium mb-1 md:mb-2">
            주문 가능
          </p>
          <p className="text-[16px] md:text-[22px] font-semibold text-gray-900 dark:text-gray-100">
            {fmt(summary?.cash ?? 0)}
          </p>
          <p className="text-[10px] md:text-[12px] text-gray-400 dark:text-slate-500 mt-1">
            원금 {fmt(summary?.initialCash ?? 0)}
          </p>
        </div>

        {/* 보유 종목 */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-3 md:px-6 py-3 md:py-5"
          data-tour="account-holdings-count"
        >
          <p className="text-[10px] md:text-[12px] text-gray-400 dark:text-slate-500 font-medium mb-1 md:mb-2">
            보유 종목
          </p>
          <p className="text-[16px] md:text-[22px] font-semibold text-gray-900 dark:text-gray-100">
            {summary?.holdingsCount ?? 0}개
          </p>
          <p className="text-[10px] md:text-[12px] text-gray-400 dark:text-slate-500 mt-1">
            평가 {fmt(summary?.totalEvaluation ?? 0)}
          </p>
        </div>

        {/* 수익률 */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-3 md:px-6 py-3 md:py-5"
          data-tour="account-return"
        >
          <p className="text-[10px] md:text-[12px] text-gray-400 font-medium mb-1 md:mb-2">
            총 수익률
          </p>
          <p
            className={`text-[16px] md:text-[22px] font-semibold ${isPositive ? "text-red-500" : "text-blue-500"}`}
          >
            {isPositive ? "+" : ""}
            {(summary?.totalReturnRate ?? 0).toFixed(2)}%
          </p>
          <p
            className={`text-[10px] md:text-[12px] mt-1 font-medium ${isPositive ? "text-red-400" : "text-blue-400"}`}
          >
            {isPositive ? "+" : ""}
            {fmt(summary?.totalReturnAmount ?? 0)}
          </p>
        </div>

        {/* 종목 비중 차트 */}
        <div className="col-span-3 md:col-span-1" data-tour="account-chart">
          <PortfolioChart
            items={summary?.holdingsRatio ?? []}
            totalEvaluation={summary?.totalEvaluation ?? 0}
            compact={isMobile}
          />
        </div>

        {/* 보유 종목 테이블 */}
        <div
          className="col-span-3 md:col-span-3"
          data-tour="account-holdings-table"
        >
          <HoldingList items={holdings} />
        </div>
      </div>
      <SpotlightTour tourKey="account" steps={ACCOUNT_TOUR} />
    </div>
  );
}
