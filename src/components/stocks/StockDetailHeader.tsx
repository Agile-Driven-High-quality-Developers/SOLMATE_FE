import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import type { StockDetail } from "@/api/stockApi";

const SECTOR_MAP: Record<string, string> = {
  INFORMATION_TECHNOLOGY: "반도체",
  SECONDARY_BATTERY: "2차전지",
  HEALTHCARE: "바이오",
  AUTOMOBILE: "자동차",
  IT: "IT",
  FINANCIALS: "금융",
  STEEL_MATERIALS: "철강",
  ENERGY_CHEMICALS: "화학",
  TELECOM: "통신",
  UTILITIES: "가변",
  CONSTRUCTION: "건설",
  CONSUMER_STAPLES: "소비재",
  INDUSTRIALS: "산업재",
  HEAVY_INDUSTRIES: "중공업",
  COMMUNICATION_SERVICES: "통신",
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
    <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 shrink-0"
      >
        <ChevronLeft size={20} />
      </button>

      <Avatar name={stock.stockName} src={stock.stockLogo} size={36} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[18px] font-bold text-gray-900">{stock.stockName}</span>
          <span className="text-[13px] text-gray-400">{stock.tickerCode}</span>
          <span className="text-[12px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
            {SECTOR_MAP[stock.sectorType] ?? stock.sectorType}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[26px] font-bold text-gray-900">
            {stock.currentPrice.toLocaleString()}원
          </span>
          <span className={`text-[14px] font-semibold ${changeColor}`}>
            {isPositive ? "▲" : isNegative ? "▼" : ""}
            {Math.abs(stock.change).toLocaleString()} ({isPositive ? "+" : ""}
            {stock.changeRate.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
