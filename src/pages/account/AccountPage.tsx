import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import { Wallet, Landmark, Package, TrendingUp, PieChart, ClipboardList } from "lucide-react";
import { useAccountSummaryQuery, useHoldingsQuery } from "@/api/accountApi";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const ACCOUNT_TOUR: TourStep[] = [
  {
    target: "account-total",
    title: <span className="inline-flex items-center gap-1.5"><Wallet size={15} />보유 총 자산</span>,
    description: "예수금과 보유 주식 평가금액을 합친 내 전체 자산이에요.",
    items: [
      "파란 카드 — 지금 내 총 자산을 한눈에 볼 수 있어요",
      "아래 수치 — 원금 대비 얼마나 벌거나 잃었는지예요",
    ],
    placement: "bottom",
  },
  {
    target: "account-cash",
    title: <span className="inline-flex items-center gap-1.5"><Landmark size={15} />보유 현금 (예수금)</span>,
    description: "아직 주식을 사지 않고 남겨둔 내 돈이에요. 이 돈으로 주식을 살 수 있어요.",
    placement: "bottom",
  },
  {
    target: "account-holdings-count",
    title: <span className="inline-flex items-center gap-1.5"><Package size={15} />보유 종목 수</span>,
    description: "지금 내가 가지고 있는 주식 종류가 몇 개인지 보여줘요.",
    placement: "bottom",
  },
  {
    target: "account-return",
    title: <span className="inline-flex items-center gap-1.5"><TrendingUp size={15} />수익률</span>,
    description: "처음 받은 1,000만원 대비 지금까지 얼마나 벌었는지(%) 보여줘요. 빨강이면 수익, 파랑이면 손실이에요.",
    placement: "bottom",
  },
  {
    target: "account-chart",
    title: <span className="inline-flex items-center gap-1.5"><PieChart size={15} />종목 비중</span>,
    description: "내가 가진 주식들이 전체 자산에서 얼마나 차지하는지 파이 차트로 보여줘요.",
    placement: "right",
  },
  {
    target: "account-holdings-table",
    title: <span className="inline-flex items-center gap-1.5"><ClipboardList size={15} />보유 종목 목록</span>,
    description: "내가 산 주식들의 상세 정보예요.",
    items: [
      "평균단가 — 내가 산 평균 가격",
      "현재가 — 지금 시장 가격",
      "평가금액 — 지금 팔면 받을 수 있는 돈",
      "수익률 — 각 종목별 손익",
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

      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-stretch">

        {/* 보유 총 자산 */}
        <div className="bg-[#0046FF] rounded-2xl px-6 py-5 text-white" data-tour="account-total">
          <p className="text-[13px] font-medium opacity-80 mb-2">보유 총 자산</p>
          <p className="text-[28px] font-bold">{fmt(summary?.totalAsset ?? 0)}</p>
          <p className={`text-[13px] font-medium mt-1 ${isPositive ? "text-red-300" : "text-blue-200"}`}>
            {isPositive ? "+" : ""}{fmt(summary?.totalReturnAmount ?? 0)} ({isPositive ? "+" : ""}{(summary?.totalReturnRate ?? 0).toFixed(2)}%)
          </p>
        </div>

        {/* 주문 가능 금액 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5" data-tour="account-cash">
          <p className="text-[13px] text-gray-400 font-medium mb-2">주문 가능 금액</p>
          <p className="text-[22px] font-bold text-gray-900">{fmt(summary?.cash ?? 0)}</p>
          <p className="text-[12px] text-gray-400 mt-1">투자원금 {fmt(summary?.initialCash ?? 0)}</p>
        </div>

        {/* 보유 종목 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5" data-tour="account-holdings-count">
          <p className="text-[13px] text-gray-400 font-medium mb-2">보유 종목</p>
          <p className="text-[22px] font-bold text-gray-900">{summary?.holdingsCount ?? 0}개</p>
          <p className="text-[12px] text-gray-400 mt-1">총 평가금액 {fmt(summary?.totalEvaluation ?? 0)}</p>
        </div>

        {/* 수익률 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5" data-tour="account-return">
          <p className="text-[13px] text-gray-400 font-medium mb-2">수익률</p>
          <p className={`text-[22px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{(summary?.totalReturnRate ?? 0).toFixed(2)}%
          </p>
          <p className={`text-[12px] mt-1 font-medium ${isPositive ? "text-red-400" : "text-blue-400"}`}>
            {isPositive ? "+" : ""}{fmt(summary?.totalReturnAmount ?? 0)}
          </p>
        </div>

        {/* 종목 비중 차트 */}
        <div className="row-start-2" data-tour="account-chart">
          <PortfolioChart
            items={summary?.holdingsRatio ?? []}
            totalEvaluation={summary?.totalEvaluation ?? 0}
          />
        </div>

        {/* 보유 종목 테이블 */}
        <div className="col-span-3 row-start-2" data-tour="account-holdings-table">
          <HoldingList items={holdings} />
        </div>
      </div>
      <SpotlightTour tourKey="account" steps={ACCOUNT_TOUR} />
    </div>
  );
}
