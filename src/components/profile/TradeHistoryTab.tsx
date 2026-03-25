import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

export type TradeHistoryItem = {
  tradeId: string;
  tradeType: "BUY" | "SELL";
  stockName: string;
  quantity: number;
  filledPrice: number;
  totalAmount: number;
  profit?: number;
  profitRate?: number;
  executedAt: string;
};

type Props = {
  items: TradeHistoryItem[];
};

export default function TradeHistoryTab({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[14px] text-gray-400">
        매매내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="text-[12px] text-gray-400">
            <th className="text-left px-4 py-3 font-semibold">종목</th>
            <th className="text-center px-3 py-3 font-semibold">구분</th>
            <th className="text-right px-3 py-3 font-semibold">수량</th>
            <th className="text-right px-3 py-3 font-semibold">체결가</th>
            <th className="text-right px-3 py-3 font-semibold">체결금액</th>
            <th className="text-right px-3 py-3 font-semibold">손익</th>
            <th className="text-right px-4 py-3 font-semibold">날짜</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => {
            const isBuy = item.tradeType === "BUY";
            const isPositive = (item.profit ?? 0) >= 0;

            return (
              <tr key={item.tradeId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={item.stockName} size={28} />
                    <span className="text-[13px] font-semibold text-gray-800">
                      {item.stockName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <Badge
                    name={isBuy ? "매수" : "매도"}
                    color={isBuy ? "#FF4444" : "#0046FF"}
                  />
                </td>
                <td className="px-3 py-3 text-right text-[13px] text-gray-600">
                  {item.quantity}주
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-medium text-gray-800">
                  {item.filledPrice.toLocaleString()}원
                </td>
                <td className="px-3 py-3 text-right text-[13px] text-gray-600">
                  {item.totalAmount.toLocaleString()}원
                </td>
                <td className="px-3 py-3 text-right">
                  {item.profit !== undefined ? (
                    <div className={`flex flex-col items-end ${isPositive ? "text-[#FF4444]" : "text-[#0046FF]"}`}>
                      <span className="text-[13px] font-bold">
                        {isPositive ? "+" : ""}
                        {item.profit.toLocaleString()}원
                      </span>
                      {item.profitRate !== undefined && (
                        <span className="text-[11px]">
                          {isPositive ? "+" : ""}
                          {item.profitRate.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[12px] text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-[12px] text-gray-400">
                  {new Date(item.executedAt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
