import { ChevronLeft, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import type { StockDetail } from "@/api/stockApi";

const SECTOR_MAP: Record<string, string> = {
  CONSTRUCTION: "건설",
  CONSUMER_DISCRETIONARY: "경기소비재",
  CONSUMER_STAPLES: "필수소비재",
  FINANCIALS: "금융",
  INDUSTRIALS: "산업재",
  ENERGY_CHEMICALS: "화학",
  INFORMATION_TECHNOLOGY: "반도체",
  HEAVY_INDUSTRIES: "중공업",
  STEEL_MATERIALS: "철강",
  COMMUNICATION_SERVICES: "통신",
  HEALTHCARE: "바이오",
};

interface Props {
  stock: StockDetail;
}

export default function StockDetailHeader({ stock }: Props) {
  const navigate = useNavigate();
  const isPositive = stock.changeRate > 0;
  const isNegative = stock.changeRate < 0;

  const changeColor = isPositive
    ? "text-red-500"
    : isNegative
      ? "text-blue-500"
      : "text-gray-500";

  return (
    <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-slate-800">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-slate-400 shrink-0"
      >
        <ChevronLeft size={20} />
      </button>

      <Avatar name={stock.stockName} src={stock.stockLogo} size={36} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[18px] font-bold text-gray-900 dark:text-gray-100">
            {stock.stockName}
          </span>
          <span className="text-[13px] text-gray-400 dark:text-slate-500">
            {stock.tickerCode}
          </span>
          <span className="text-[12px] text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
            {SECTOR_MAP[stock.sectorType] ?? stock.sectorType}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            {stock.currentPrice.toLocaleString()}원
          </span>
          <span
            className={`inline-flex items-center gap-0.5 text-[14px] font-semibold ${changeColor}`}
          >
            {isPositive ? (
              <ArrowUp size={13} />
            ) : isNegative ? (
              <ArrowDown size={13} />
            ) : null}
            {Math.abs(stock.change).toLocaleString()} ({isPositive ? "+" : ""}
            {stock.changeRate.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
