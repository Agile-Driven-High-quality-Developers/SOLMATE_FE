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

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function HoldingList({ items }: { items: HoldingItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-900">보유 종목</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-6 py-3 text-[12px] text-gray-400 font-medium">종목</th>
            <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">수량</th>
            <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">평균단가</th>
            <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">현재가</th>
            <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">평가액</th>
            <th className="text-right px-6 py-3 text-[12px] text-gray-400 font-medium">수익률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => {
            const isPositive = item.profitRate >= 0;
            return (
              <tr key={item.tickerCode} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.stockName} src={item.stockLogo} size={34} />
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">{item.stockName}</p>
                      <p className="text-[11px] text-gray-400">{item.tickerCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-[14px] font-semibold text-gray-900 tabular-nums">
                  {item.quantity}주
                </td>
                <td className="px-4 py-3.5 text-right text-[13px] text-gray-500 tabular-nums">
                  {item.averageBuyPrice.toLocaleString()}원
                </td>
                <td className="px-4 py-3.5 text-right text-[14px] font-semibold text-gray-900 tabular-nums">
                  {item.currentPrice.toLocaleString()}원
                </td>
                <td className="px-4 py-3.5 text-right text-[14px] font-semibold text-gray-900 tabular-nums">
                  {fmt(item.evaluationAmount)}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <p className={`text-[13px] font-semibold tabular-nums ${isPositive ? "text-red-500" : "text-blue-500"}`}>
                    {isPositive ? "+" : ""}{item.profitRate.toFixed(2)}%
                  </p>
                  <p className={`text-[11px] font-medium tabular-nums ${isPositive ? "text-red-400" : "text-blue-400"}`}>
                    {isPositive ? "+" : ""}{fmt(item.profitAmount)}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
