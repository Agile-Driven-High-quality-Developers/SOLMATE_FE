import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import type { TradeHistoryItem } from "@/api/tradeApi";

type Props = {
  items: TradeHistoryItem[];
};

export default function TradeHistoryTab({ items }: Props) {
  const navigate = useNavigate();
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
          {items.map((item, index) => {
            const isBuy = item.tradeType === "BUY";
            const isPositive = (item.profitAmount ?? 0) >= 0;

            return (
              <tr key={index} className={`hover:bg-gray-50 transition-colors ${item.tickerCode ? "cursor-pointer" : ""}`} onClick={() => item.tickerCode && navigate(`/invest/${item.tickerCode}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={item.stockName} src={item.stockLogo} size={28} />
                    <span className="text-[13px] font-semibold text-gray-800">
                      {item.stockName}
                    </span>
                  </div>
                </td>
                <td className={`px-3 py-3 text-center text-[13px] font-semibold ${isBuy ? "text-[#FF4444]" : "text-[#0046FF]"}`}>
                  {isBuy ? "매수" : "매도"}
                </td>
                <td className="px-3 py-3 text-right text-[13px] text-gray-600">
                  {item.quantity}주
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-medium text-gray-800">
                  {item.price.toLocaleString()}원
                </td>
                <td className="px-3 py-3 text-right text-[13px] text-gray-600">
                  {item.amount.toLocaleString()}원
                </td>
                <td className="px-3 py-3 text-right">
                  {item.profitAmount != null ? (
                    <div className={`flex flex-col items-end ${isPositive ? "text-[#FF4444]" : "text-[#0046FF]"}`}>
                      <span className="text-[13px] font-bold">
                        {isPositive ? "+" : ""}
                        {item.profitAmount.toLocaleString()}원
                      </span>
                      {item.profitRate != null && (
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
                  {new Date(item.tradedAt).toLocaleDateString("ko-KR", {
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
