import type { StockTradeOrder } from "@/api/stockApi";
import { useCancelOrderMutation } from "@/api/stockApi";

function formatAmount(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(1)}만원`;
  return `${amount.toLocaleString()}원`;
}

interface Props {
  tickerCode: string;
  orders: StockTradeOrder[];
}

export default function TradeHistory({ tickerCode, orders }: Props) {
  const { mutate: cancelOrder, isPending } = useCancelOrderMutation(tickerCode);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-4">거래 내역</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-800">
            {["구분", "주문유형", "주문가격", "수량", "주문금액", "상태"].map((h) => (
              <th key={h} className="text-left pb-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-[13px] text-gray-400 dark:text-slate-500">
                거래 내역이 없습니다.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800">
                <td className="py-3">
                  <span
                    className={`text-[13px] font-semibold ${
                      order.side === "BUY" ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {order.sideLabel}
                  </span>
                </td>
                <td className="py-3 text-[13px] text-gray-600 dark:text-slate-400">{order.orderTypeLabel}</td>
                <td className="py-3 text-[13px] text-gray-900 dark:text-gray-100">
                  {order.orderPrice.toLocaleString()}원
                </td>
                <td className="py-3 text-[13px] text-gray-900 dark:text-gray-100">{order.quantity}주</td>
                <td className="py-3 text-[13px] text-gray-900 dark:text-gray-100">
                  {formatAmount(order.orderAmount)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[13px] ${
                        order.status === "CANCELLED" ? "text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                    {order.cancelable && (
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        disabled={isPending}
                        className="text-[12px] text-gray-400 dark:text-slate-500 hover:text-red-500 border border-gray-200 dark:border-slate-700 rounded px-1.5 py-0.5 transition-colors disabled:opacity-50"
                      >
                        × 취소
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
