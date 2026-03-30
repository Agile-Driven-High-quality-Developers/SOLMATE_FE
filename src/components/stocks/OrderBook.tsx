import { useState } from "react";
import type { OrderBookData } from "@/api/stockApi";

interface Props {
  orderBook: OrderBookData;
  holdingQuantity?: number;
  onPriceClick?: (price: number, side: "buy" | "sell") => void;
}

export default function OrderBook({
  orderBook,
  holdingQuantity = 0,
  onPriceClick,
}: Props) {
  const { sellLevels, buyLevels, currentPrice, changeRate } = orderBook;
  const isPositive = changeRate > 0;
  const hasHolding = holdingQuantity > 0;

  const [pendingPrice, setPendingPrice] = useState<number | null>(null);

  const maxQuantity = Math.max(
    ...sellLevels.map((l) => l.quantity),
    ...buyLevels.map((l) => l.quantity),
  );

  const previousClose = currentPrice / (1 + changeRate / 100);
  const currentInSell = sellLevels.some((l) => l.price === currentPrice);

  const handleRowClick = (price: number) => {
    if (!onPriceClick) return;
    setPendingPrice(price);
  };

  const handleSideSelect = (side: "buy" | "sell") => {
    if (pendingPrice === null) return;
    onPriceClick?.(pendingPrice, side);
    setPendingPrice(null);
  };

  const renderRow = (
    level: { price: number; quantity: number },
    i: number,
    side: "sell" | "buy",
  ) => {
    const ratio = maxQuantity > 0 ? level.quantity / maxQuantity : 0;
    const priceDiff = ((level.price - previousClose) / previousClose) * 100;
    const isCurrent =
      level.price === currentPrice && (side === "sell" ? true : !currentInSell);
    const bgColor =
      side === "sell" ? "rgba(59,130,246,0.12)" : "rgba(239,68,68,0.12)";
    const quantityColor =
      side === "sell"
        ? "text-blue-400 dark:text-blue-500"
        : "text-red-400 dark:text-red-500";

    return (
      <div
        key={i}
        onClick={() => handleRowClick(level.price)}
        className={`relative flex items-center py-1.5 overflow-hidden ${
          isCurrent
            ? "border-2 rounded z-10 my-px [border-color:#b5b5b5]"
            : "border-b border-gray-50 dark:border-slate-800"
        } ${onPriceClick ? "cursor-pointer hover:brightness-95 dark:hover:brightness-110" : ""}`}
      >
        <div
          className="absolute inset-y-0 right-0"
          style={{ width: `${ratio * 100}%`, backgroundColor: bgColor }}
        />
        <span
          className={`relative w-[40%] tabular-nums ${
            isCurrent
              ? `font-bold ${priceDiff >= 0 ? "text-red-500" : "text-blue-500"}`
              : `font-medium ${priceDiff >= 0 ? "text-red-500" : "text-blue-500"}`
          }`}
        >
          {level.price.toLocaleString()}
        </span>
        <span
          className={`relative w-[25%] text-center text-[11px] tabular-nums ${
            isCurrent
              ? isPositive
                ? "font-semibold text-red-500"
                : "font-semibold text-blue-500"
              : priceDiff >= 0
                ? "text-red-400"
                : "text-blue-400"
          }`}
        >
          {isCurrent
            ? `${isPositive ? "+" : ""}${changeRate.toFixed(2)}%`
            : `${priceDiff > 0 ? "+" : ""}${priceDiff.toFixed(2)}%`}
        </span>
        <span
          className={`relative w-[35%] text-right tabular-nums ${isCurrent ? "text-gray-400 dark:text-slate-500" : quantityColor}`}
        >
          {level.quantity.toLocaleString()}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
        <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-3">
          호가
        </h3>
        <div className="flex flex-col text-[13px]">
          {sellLevels
            .slice()
            .reverse()
            .map((level, i) => renderRow(level, i, "sell"))}
          {buyLevels.map((level, i) => renderRow(level, i, "buy"))}
        </div>
      </div>

      {/* 매수/매도 선택 팝업 */}
      {pendingPrice !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setPendingPrice(null)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 w-64 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[13px] text-gray-500 dark:text-slate-400 text-center mb-1">
              주문 가격
            </p>
            <p className="text-[18px] font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
              {pendingPrice.toLocaleString()}원
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSideSelect("buy")}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[14px] font-bold"
              >
                매수
              </button>
              <button
                onClick={() => hasHolding && handleSideSelect("sell")}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold ${
                  hasHolding
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-500 cursor-not-allowed"
                }`}
              >
                매도
              </button>
            </div>
            {!hasHolding && (
              <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center mt-2">
                보유 주식이 없어 매도할 수 없어요
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
