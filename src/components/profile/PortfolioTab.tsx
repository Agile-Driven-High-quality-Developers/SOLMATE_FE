import Avatar from "@/components/ui/Avatar";

export type PortfolioHolding = {
  stockId: string;
  stockName: string;
  quantity: number;
  profitLossRate: number;
};

export type PortfolioData = {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossRate: number;
  holdings: PortfolioHolding[];
};

type Props = {
  data: PortfolioData;
};

function fmtAmount(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString("ko-KR");
}

export default function PortfolioTab({ data }: Props) {
  const isPositive = data.totalProfitLossRate >= 0;

  return (
    <div className="flex flex-col gap-5">
      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-[12px] text-gray-400 mb-1">총 평가금액</p>
          <p className="text-[16px] font-bold text-gray-900">
            {fmtAmount(data.totalValue)}원
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-[12px] text-gray-400 mb-1">총 수익률</p>
          <p
            className={`text-[16px] font-bold ${
              isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
            }`}
          >
            {isPositive ? "+" : ""}
            {data.totalProfitLossRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-[12px] text-gray-400 mb-1">총 수익</p>
          <p
            className={`text-[16px] font-bold ${
              isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
            }`}
          >
            {isPositive ? "+" : ""}
            {fmtAmount(data.totalProfitLoss)}원
          </p>
        </div>
      </div>

      {/* 보유 종목 */}
      <div>
        <p className="text-[14px] font-semibold text-gray-700 mb-3">보유 종목</p>
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-[12px] text-gray-400">
                <th className="text-left px-4 py-3 font-semibold">종목</th>
                <th className="text-right px-3 py-3 font-semibold">수량</th>
                <th className="text-right px-4 py-3 font-semibold">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.holdings.map((h) => {
                const isHoldingPositive = h.profitLossRate >= 0;
                return (
                  <tr key={h.stockId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={h.stockName} size={28} />
                        <span className="text-[13px] font-medium text-gray-800">
                          {h.stockName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-[12px] text-gray-500">
                      {h.quantity}주
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-[13px] font-bold ${
                        isHoldingPositive ? "text-[#FF4444]" : "text-[#0046FF]"
                      }`}
                    >
                      {isHoldingPositive ? "+" : ""}
                      {h.profitLossRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
