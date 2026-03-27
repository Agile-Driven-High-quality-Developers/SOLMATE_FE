import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import { useAccountSummaryQuery, useHoldingsQuery } from "@/api/accountApi";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const ACCOUNT_TOUR: TourStep[] = [
  {
    target: "account-summary",
    title: "💳 내 계좌 한눈에",
    description: "내 투자 현황을 나타내는 4가지 지표예요.",
    items: [
      "총 자산 — 예수금 + 보유 주식 평가금액",
      "보유 현금 — 아직 투자하지 않은 내 돈 (예수금)",
      "보유 종목 — 현재 가지고 있는 주식 수",
      "수익률 — 원금 대비 얼마나 벌었는지 (%)",
    ],
    placement: "bottom",
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

  const holdings = holdingsRaw.map((h) => ({
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
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 계좌</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">나의 투자 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-stretch" data-tour="account-summary">

        {/* 보유 총 자산 */}
        <div className="bg-[#0046FF] rounded-2xl px-6 py-5 text-white">
          <p className="text-[13px] font-medium opacity-80 mb-2">보유 총 자산</p>
          <p className="text-[28px] font-bold">{fmt(summary?.totalAsset ?? 0)}</p>
          <p className={`text-[13px] font-medium mt-1 ${isPositive ? "text-red-300" : "text-blue-200"}`}>
            {isPositive ? "+" : ""}{fmt(summary?.totalReturnAmount ?? 0)} ({isPositive ? "+" : ""}{(summary?.totalReturnRate ?? 0).toFixed(2)}%)
          </p>
        </div>

        {/* 보유 현금 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <p className="text-[13px] text-gray-400 font-medium mb-2">보유 현금</p>
          <p className="text-[22px] font-bold text-gray-900">{fmt(summary?.cash ?? 0)}</p>
          <p className="text-[12px] text-gray-400 mt-1">투자원금 {fmt(summary?.initialCash ?? 0)}</p>
        </div>

        {/* 보유 종목 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <p className="text-[13px] text-gray-400 font-medium mb-2">보유 종목</p>
          <p className="text-[22px] font-bold text-gray-900">{summary?.holdingsCount ?? 0}개</p>
          <p className="text-[12px] text-gray-400 mt-1">총 평가금액 {fmt(summary?.totalEvaluation ?? 0)}</p>
        </div>

        {/* 수익률 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <p className="text-[13px] text-gray-400 font-medium mb-2">수익률</p>
          <p className={`text-[22px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{(summary?.totalReturnRate ?? 0).toFixed(2)}%
          </p>
          <p className={`text-[12px] mt-1 font-medium ${isPositive ? "text-red-400" : "text-blue-400"}`}>
            {isPositive ? "+" : ""}{fmt(summary?.totalReturnAmount ?? 0)}
          </p>
        </div>

        {/* 종목 비중 차트 */}
        <div className="row-start-2">
          <PortfolioChart
            items={summary?.holdingsRatio ?? []}
            totalEvaluation={summary?.totalEvaluation ?? 0}
          />
        </div>

        {/* 보유 종목 테이블 */}
        <div className="col-span-3 row-start-2">
          <HoldingList items={holdings} />
        </div>
      </div>
      <SpotlightTour tourKey="account" steps={ACCOUNT_TOUR} />
    </div>
  );
}
