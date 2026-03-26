import SummaryCard from "@/components/account/SummaryCard";
import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import type { PortfolioItem } from "@/components/account/PortfolioChart";
import type { HoldingItem } from "@/components/account/HoldingList";

type Props = {
  totalEvaluation: number;
  totalReturnRate: number;
  totalReturnAmount: number;
  portfolio: PortfolioItem[];
  holdings: HoldingItem[];
};

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function PortfolioTab({
  totalEvaluation,
  totalReturnRate,
  totalReturnAmount,
  portfolio,
  holdings,
}: Props) {
  const isPositive = totalReturnRate >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="총 평가금액" value={fmt(totalEvaluation)} />
        <SummaryCard
          label="총 수익률"
          value={`${isPositive ? "+" : ""}${totalReturnRate.toFixed(2)}%`}
          valueColor={isPositive ? "text-red-500" : "text-blue-500"}
        />
        <SummaryCard
          label="총 수익"
          value={`${isPositive ? "+" : ""}${fmt(totalReturnAmount)}`}
          valueColor={isPositive ? "text-red-500" : "text-blue-500"}
        />
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-4 h-130">
        <PortfolioChart items={portfolio} />
        <HoldingList items={holdings} showAvgPrice={false} />
      </div>
    </div>
  );
}
