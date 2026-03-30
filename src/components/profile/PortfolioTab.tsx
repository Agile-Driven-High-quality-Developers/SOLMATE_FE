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
  compact?: boolean;
  showAvgPrice?: boolean;
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
  compact = true,
  showAvgPrice = false,
}: Props) {
  const isPositive = totalReturnRate >= 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
          <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1">총 평가금액</p>
          <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100">{fmt(totalEvaluation)}</p>
        </div>
        <div className="rounded-xl px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
          <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1">총 수익률</p>
          <p className={`text-[16px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{totalReturnRate.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-xl px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
          <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1">총 수익</p>
          <p className={`text-[16px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{fmt(totalReturnAmount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-3 flex-1 min-h-0">
        <PortfolioChart items={portfolio} compact={compact} totalEvaluation={totalEvaluation} />
        <HoldingList items={holdings} showAvgPrice={showAvgPrice} compact={compact} />
      </div>
    </div>
  );
}
