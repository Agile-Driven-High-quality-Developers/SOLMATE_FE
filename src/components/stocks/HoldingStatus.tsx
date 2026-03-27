import type { StockHolding } from "@/api/stockApi";

function formatWon(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (abs >= 10_000) return `${(amount / 10_000).toFixed(1)}만원`;
  return `${amount.toLocaleString()}원`;
}

interface Props {
  holding: StockHolding | undefined;
  cash: number | undefined;
  onBuy: () => void;
  onSell: () => void;
}

export default function HoldingStatus({ holding, cash, onBuy, onSell }: Props) {
  const isPositive = (holding?.profitRate ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3">내 보유 현황</h3>
        {holding && holding.holdingQuantity > 0 ? (
          <div className="flex flex-col gap-2">
            {[
              { label: "보유수량", value: `${holding.holdingQuantity}주` },
              { label: "평균매수가", value: `${holding.averageBuyPrice.toLocaleString()}원` },
              { label: "평가금액", value: formatWon(holding.evaluationAmount) },
              {
                label: "평가손익",
                value: `${holding.profitAmount >= 0 ? "+" : ""}${formatWon(holding.profitAmount)}`,
                colored: true,
              },
              {
                label: "수익률",
                value: `${holding.profitRate >= 0 ? "+" : ""}${holding.profitRate.toFixed(2)}%`,
                colored: true,
              },
            ].map(({ label, value, colored }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[13px] text-gray-400">{label}</span>
                <span
                  className={`text-[13px] font-medium ${
                    colored
                      ? isPositive
                        ? "text-red-500"
                        : "text-blue-500"
                      : "text-gray-900"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">보유 종목 없음</p>
        )}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-[13px] text-gray-400 mb-1">주문 가능 금액</p>
        <p className="text-[18px] font-bold text-gray-900">
          {cash != null ? `${cash.toLocaleString()}원` : "-"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onBuy}
          className="py-2.5 rounded-xl bg-red-500 text-white text-[14px] font-semibold hover:bg-red-600 transition-colors cursor-pointer"
        >
          매수
        </button>
        <button
          onClick={onSell}
          className="py-2.5 rounded-xl bg-[#0046FF] text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          매도
        </button>
      </div>
    </div>
  );
}
