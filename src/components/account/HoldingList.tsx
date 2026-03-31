import { useRef, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import ScrollHintOverlay from "@/components/ui/ScrollHintOverlay";

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
  headerRight?: ReactNode;
};

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString()}원`;
}

function ReturnText({
  value,
  isPositive,
  className = "",
}: {
  value: string;
  isPositive: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        isPositive ? "text-red-500" : "text-blue-500",
        className,
      ].join(" ")}
    >
      {value}
    </span>
  );
}

export default function HoldingList({
  items,
  hasMore = false,
  onLoadMore,
  isLoading = false,
  showAvgPrice = true,
}: Props) {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!onLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) onLoadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col md:h-full">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
          보유 종목
        </h2>
      </div>

      {/* 모바일: 가로 스크롤 카드 */}
      {items.length === 0 ? (
        <div className="md:hidden py-8 text-center text-[13px] text-gray-400 dark:text-slate-500">
          보유 종목이 없습니다.
        </div>
      ) : (
        <div className="md:hidden overflow-x-auto">
          <div className="flex gap-3 pl-4 py-3">
            {items.map((item) => {
              const isPositive = item.profitRate >= 0;
              return (
                <div
                  key={item.tickerCode}
                  onClick={() => navigate(`/invest/${item.tickerCode}`)}
                  className="shrink-0 w-29 bg-gray-50 dark:bg-slate-800 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-2 min-w-0">
                    <Avatar name={item.stockName} src={item.stockLogo} size={20} />
                    <p className="text-[12px] font-bold text-gray-900 dark:text-gray-100 truncate">
                      {item.stockName}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-0.5 whitespace-nowrap">
                    {item.quantity}주
                  </p>
                  <ReturnText
                    value={`${isPositive ? "+" : ""}${item.profitRate.toFixed(2)}%`}
                    isPositive={isPositive}
                    className="text-[13px] font-bold whitespace-nowrap"
                  />
                </div>
              );
            })}
            {/* overflow 시 우측 여백 확보용 spacer */}
            <div className="shrink-0 w-4" />
          </div>
        </div>
      )}

      {/* 데스크탑: 테이블 */}
      <div className="hidden md:block overflow-y-auto flex-1 min-h-0">
        <ScrollHintOverlay>
        <table className="w-full border-collapse">
          {/* 데스크탑 헤더 (sm 이상에서만 표시) */}
          <thead className="hidden sm:table-header-group sticky top-0 bg-white dark:bg-slate-900 z-10">
            <tr className="bg-gray-50 dark:bg-slate-800">
              <th className="text-left px-5 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                종목
              </th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                수량
              </th>
              {showAvgPrice && (
                <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                  평균단가
                </th>
              )}
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                현재가
              </th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                평가금액
              </th>
              <th className="text-right px-5 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                수익률
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-[13px] text-gray-400 dark:text-slate-500"
                >
                  보유 종목이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isPositive = item.profitRate >= 0;
                return (
                  <tr
                    key={item.tickerCode}
                    onClick={() => navigate(`/invest/${item.tickerCode}`)}
                    className="flex flex-col sm:table-row relative hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {/* 종목명 */}
                    <td className="px-5 py-4 sm:py-3 sm:table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={item.stockName}
                          src={item.stockLogo}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="text-[15px] sm:text-[14px] font-bold sm:font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.stockName}
                          </p>
                          <p className="text-[12px] sm:text-[11px] text-gray-400 dark:text-slate-500">
                            {item.tickerCode}
                            <span className="sm:hidden">
                              {" "}
                              · {item.quantity}주
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 수량 (데스크탑만) */}
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-[14px] text-gray-600 dark:text-gray-400 tabular-nums whitespace-nowrap">
                      {item.quantity}주
                    </td>

                    {/* 평균단가 (데스크탑만) */}
                    {showAvgPrice && (
                      <td className="hidden sm:table-cell px-4 py-3 text-right text-[13px] text-gray-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {item.averageBuyPrice.toLocaleString()}원
                      </td>
                    )}

                    {/* 현재가 (데스크탑만) */}
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
                      {item.currentPrice.toLocaleString()}원
                    </td>

                    {/* 평가금액 (모바일: 좌측 하단 / 데스크탑: 열) */}
                    <td className="px-5 pb-5 sm:p-0 sm:px-4 sm:py-3 sm:table-cell sm:text-right whitespace-nowrap">
                      <div className="flex flex-col sm:block">
                        <span className="sm:hidden text-[11px] text-gray-400 dark:text-slate-500 mb-0.5">
                          평가금액
                        </span>
                        <span className="text-[14px] font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                          {fmt(item.evaluationAmount)}
                        </span>
                      </div>
                    </td>

                    {/* 수익률 + 손익 (모바일: 우측 고정 / 데스크탑: 열) */}
                    <td className="absolute right-5 bottom-4 sm:static sm:table-cell sm:px-5 sm:py-3 sm:text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <ReturnText
                          value={`${isPositive ? "+" : ""}${item.profitRate.toFixed(2)}%`}
                          isPositive={isPositive}
                          className="text-[16px] sm:text-[13px] font-bold sm:font-semibold tabular-nums"
                        />
                        <ReturnText
                          value={`${isPositive ? "+" : ""}${fmt(item.profitAmount)}`}
                          isPositive={isPositive}
                          className="text-[12px] sm:text-[11px] font-medium tabular-nums"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

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
        </ScrollHintOverlay>
      </div>
    </div>
  );
}
