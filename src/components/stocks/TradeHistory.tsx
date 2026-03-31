import { useState } from "react";
import { X } from "lucide-react";
import type { StockTradeOrder } from "@/api/stockApi";
import { useCancelOrderMutation } from "@/api/stockApi";
import Button from "@/components/ui/Button";
import ScrollHintOverlay from "@/components/ui/ScrollHintOverlay";

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
  const [confirmOrderId, setConfirmOrderId] = useState<number | null>(null);

  function handleCancelConfirm() {
    if (confirmOrderId !== null) {
      cancelOrder(confirmOrderId);
      setConfirmOrderId(null);
    }
  }

  return (
    <>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
      <h3 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100 mb-4">
        거래 내역
      </h3>
      <ScrollHintOverlay>
      <table className="w-full min-w-120">

        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-800">
            <th className="text-left py-3 pl-4 pr-6 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
              구분
            </th>
            <th className="text-left py-3 px-6 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
              주문유형
            </th>
            <th className="text-right py-3 px-6 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
              주문가격
            </th>
            <th className="text-right py-3 px-6 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
              수량
            </th>
            <th className="text-right py-3 pl-6 pr-12 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
              주문금액
            </th>
            <th className="text-left py-3 pl-6 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
              상태
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-10 text-[12px] text-gray-400 dark:text-slate-500"
              >
                거래 내역이 없습니다.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.orderId}
                className="hover:bg-gray-50/50 dark:hover:bg-slate-800"
              >
                <td className="py-3.5 pl-4 pr-6 whitespace-nowrap">
                  <span
                    className={`text-[12px] font-semibold ${
                      order.side === "BUY" ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {order.sideLabel}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-[12px] text-gray-600 dark:text-slate-400 whitespace-nowrap">
                  {order.orderTypeLabel}
                </td>
                <td className="py-3.5 px-6 text-right text-[12px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
                  {order.orderPrice.toLocaleString()}원
                </td>
                <td className="py-3.5 px-6 text-right text-[12px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
                  {order.quantity}주
                </td>
                <td className="py-3.5 pl-6 pr-12 text-right text-[12px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
                  {formatAmount(order.orderAmount)}
                </td>
                <td className="py-3.5 pl-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] font-semibold ${
                        order.status === "CANCELLED"
                          ? "text-gray-400 dark:text-slate-500"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                    {order.cancelable && (
                      <button
                        onClick={() => setConfirmOrderId(order.orderId)}
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
      </ScrollHintOverlay>
    </div>

    {confirmOrderId !== null && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" onClick={() => setConfirmOrderId(null)}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-90 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
            <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">주문 취소</p>
            <button onClick={() => setConfirmOrderId(null)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-6">
            <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">주문을 취소하시겠어요?</p>
            <p className="text-[12px] text-gray-400 dark:text-slate-500">취소된 주문은 되돌릴 수 없어요.</p>
          </div>
          <div className="flex gap-2 px-6 pb-6">
            <Button variant="invalid" className="flex-1 py-2.5" onClick={() => setConfirmOrderId(null)}>닫기</Button>
            <Button variant="primary" className="flex-1 py-2.5" onClick={handleCancelConfirm} disabled={isPending}>주문 취소</Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
