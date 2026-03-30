import type { OrderBookData } from "@/api/stockApi";

interface Props {
  orderBook: OrderBookData;
}

export default function OrderBook({ orderBook }: Props) {
  const { sellLevels, buyLevels, currentPrice, changeRate } = orderBook;
  const isPositive = changeRate > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
      <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-3">호가 (10단계)</h3>
      <div className="flex flex-col text-[13px]">
        {/* 매도호가 — 빨강, 높은 가격이 위 */}
        {sellLevels.map((level, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-slate-800">
            <span className="text-red-500 font-medium tabular-nums">
              {level.price.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-slate-500 tabular-nums">{level.quantity.toLocaleString()}</span>
          </div>
        ))}

        {/* 현재가 */}
        <div className="flex justify-between py-2 bg-gray-50 dark:bg-slate-800 px-1 my-0.5 rounded">
          <span className="font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {currentPrice.toLocaleString()}
          </span>
          <span className={`font-semibold tabular-nums ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{changeRate.toFixed(2)}%
          </span>
        </div>

        {/* 매수호가 — 파랑, 높은 가격이 위 */}
        {buyLevels.map((level, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-slate-800">
            <span className="text-blue-500 font-medium tabular-nums">
              {level.price.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-slate-500 tabular-nums">{level.quantity.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
