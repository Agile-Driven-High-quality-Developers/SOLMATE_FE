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
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-[15px] font-semibold text-gray-900 mb-4">거래 내역</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["구분", "주문유형", "주문가격", "수량", "주문금액", "상태"].map((h) => (
              <th key={h} className="text-left pb-2.5 text-[12px] text-gray-400 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-[13px] text-gray-400">
                거래 내역이 없습니다.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50/50">
                <td className="py-3">
                  <span
                    className={`text-[13px] font-semibold ${
                      order.side === "BUY" ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {order.sideLabel}
                  </span>
                </td>
                <td className="py-3 text-[13px] text-gray-600">{order.orderTypeLabel}</td>
                <td className="py-3 text-[13px] text-gray-900">
                  {order.orderPrice.toLocaleString()}원
                </td>
                <td className="py-3 text-[13px] text-gray-900">{order.quantity}주</td>
                <td className="py-3 text-[13px] text-gray-900">
                  {formatAmount(order.orderAmount)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[13px] ${
                        order.status === "CANCELLED" ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                    {order.cancelable && (
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        disabled={isPending}
                        className="text-[12px] text-gray-400 hover:text-red-500 border border-gray-200 rounded px-1.5 py-0.5 transition-colors disabled:opacity-50"
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
