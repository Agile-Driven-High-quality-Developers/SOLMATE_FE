import SummaryCard from "@/components/account/SummaryCard";
import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import { useAccountSummaryQuery, useHoldingsQuery } from "@/api/accountApi";

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(0)}만원`;
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

  const portfolio = (summary?.holdingsRatio ?? []).map((h) => ({
    stockName: h.stockName,
    ratio: h.ratio,
  }));

  const totalAsset = summary?.totalAsset ?? 0;
  const totalReturnAmount = summary?.totalReturnAmount ?? 0;
  const totalReturnRate = summary?.totalReturnRate ?? 0;
  const cash = summary?.cash ?? 0;
  const initialCash = summary?.initialCash ?? 0;
  const holdingsCount = summary?.holdingsCount ?? 0;
  const totalEvaluation = summary?.totalEvaluation ?? 0;
  const isPositive = totalReturnAmount >= 0;

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 계좌</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">나의 투자 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-stretch">

        <SummaryCard
          label="보유 총 자산"
          value={fmt(totalAsset)}
          sub={`${isPositive ? "+" : ""}${fmt(totalReturnAmount)} (${isPositive ? "+" : ""}${totalReturnRate.toFixed(2)}%)`}
          variant="blue"
          subColor={isPositive ? "text-red-300" : "text-blue-200"}
        />
        <SummaryCard
          label="보유 현금"
          value={fmt(cash)}
          sub={`투자원금 ${fmt(initialCash)}`}
        />
        <SummaryCard
          label="보유 종목"
          value={`${holdingsCount}개`}
          sub={`총 평가가 ${fmt(totalEvaluation)}`}
        />
        <SummaryCard
          label="수익률"
          value={`${isPositive ? "+" : ""}${totalReturnRate.toFixed(2)}%`}
          sub={`${isPositive ? "+" : ""}${fmt(totalReturnAmount)}`}
          valueColor={isPositive ? "text-red-500" : "text-blue-500"}
          subColor={isPositive ? "text-red-400" : "text-blue-400"}
        />

        <div className="row-start-2 h-130">
          <PortfolioChart items={portfolio} />
        </div>

        <div className="col-span-3 row-start-2 h-130">
          <HoldingList items={holdings} />
        </div>
      </div>
    </div>
  );
}
