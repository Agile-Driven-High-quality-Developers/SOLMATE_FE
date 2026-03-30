import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";

export type HoldingItem = {
  tickerCode: string;
  stockName: string;
  stockLogo: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  evaluationAmount: number;
  profitRate: number;
  profitAmount: number;
};

type Props = {
  items: HoldingItem[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  showAvgPrice?: boolean;
  compact?: boolean;
};

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function HoldingList({
  items,
  hasMore = false,
  onLoadMore,
  isLoading = false,
  showAvgPrice = true,
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!onLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100">보유 종목</h2>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
<<<<<<< HEAD
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className={`text-left ${compact ? "px-3 py-2" : "px-6 py-3"} text-[11px] text-gray-400 font-medium`}>종목</th>
              <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 font-medium`}>수량</th>
              {showAvgPrice && <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 font-medium`}>평균단가</th>}
              <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 font-medium`}>현재가</th>
              <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 font-medium`}>평가금액</th>
              <th className={`text-right ${compact ? "px-3 py-2" : "px-6 py-3"} text-[11px] text-gray-400 font-medium`}>종목 수익률</th>
=======
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <th className={`text-left ${compact ? "px-3 py-2" : "px-6 py-3"} text-[11px] text-gray-400 dark:text-slate-500 font-medium`}>종목</th>
              <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 dark:text-slate-500 font-medium`}>수량</th>
              {showAvgPrice && <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 dark:text-slate-500 font-medium`}>평균단가</th>}
              <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 dark:text-slate-500 font-medium`}>현재가</th>
              <th className={`text-right ${compact ? "px-2 py-2" : "px-4 py-3"} text-[11px] text-gray-400 dark:text-slate-500 font-medium`}>평가금액</th>
              <th className={`text-right ${compact ? "px-3 py-2" : "px-6 py-3"} text-[11px] text-gray-400 dark:text-slate-500 font-medium`}>수익률</th>
>>>>>>> 3565c14 (feat: 다크모드 구현)
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {items.map((item) => {
              const isPositive = item.profitRate >= 0;
              return (
                <tr key={item.tickerCode} className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => navigate(`/invest/${item.tickerCode}`)}>
                  <td className={compact ? "px-3 py-2" : "px-6 py-3.5"}>
                    <div className="flex items-center gap-2">
                      <Avatar name={item.stockName} src={item.stockLogo} size={compact ? 26 : 34} />
                      <div>
                        <p className={`${compact ? "text-[12px]" : "text-[14px]"} font-semibold text-gray-900 dark:text-gray-100`}>{item.stockName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500">{item.tickerCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${compact ? "px-2 py-2" : "px-4 py-3.5"} text-right ${compact ? "text-[11px]" : "text-[14px]"} font-semibold text-gray-900 dark:text-gray-100 tabular-nums`}>
                    {item.quantity}주
                  </td>
                  {showAvgPrice && (
                    <td className={`${compact ? "px-2 py-2" : "px-4 py-3.5"} text-right ${compact ? "text-[11px]" : "text-[13px]"} text-gray-500 dark:text-slate-400 tabular-nums`}>
                      {item.averageBuyPrice.toLocaleString()}원
                    </td>
                  )}
                  <td className={`${compact ? "px-2 py-2" : "px-4 py-3.5"} text-right ${compact ? "text-[11px]" : "text-[14px]"} font-semibold text-gray-900 dark:text-gray-100 tabular-nums`}>
                    {item.currentPrice.toLocaleString()}원
                  </td>
                  <td className={`${compact ? "px-2 py-2" : "px-4 py-3.5"} text-right ${compact ? "text-[11px]" : "text-[14px]"} font-semibold text-gray-900 dark:text-gray-100 tabular-nums`}>
                    {fmt(item.evaluationAmount)}
                  </td>
                  <td className={compact ? "px-3 py-2 text-right" : "px-6 py-3.5 text-right"}>
                    <p className={`${compact ? "text-[11px]" : "text-[13px]"} font-semibold tabular-nums ${isPositive ? "text-red-500" : "text-blue-500"}`}>
                      {isPositive ? "+" : ""}{item.profitRate.toFixed(2)}%
                    </p>
                    <p className={`${compact ? "text-[10px]" : "text-[11px]"} font-medium tabular-nums ${isPositive ? "text-red-400" : "text-blue-400"}`}>
                      {isPositive ? "+" : ""}{fmt(item.profitAmount)}
                    </p>
                  </td>
                </tr>
              );
            })}

            {/* 무한 스크롤 트리거 */}
            <tr ref={sentinelRef}>
              <td colSpan={6}>
                {isLoading && (
                  <div className="py-4 text-center text-[13px] text-gray-400 dark:text-slate-500">
                    불러오는 중...
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
