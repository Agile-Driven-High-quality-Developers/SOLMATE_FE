export type AssetSummaryData = {
  totalAsset: number;
  totalProfit: number;
  totalProfitRate: number;
  cash: number;
  investAmount: number;
  holdingCount: number;
  evaluationAmount: number;
};

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function AssetSummary({ data }: { data: AssetSummaryData }) {
  const isPositive = data.totalProfit >= 0;

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-[#0046FF] rounded-2xl px-6 py-5 text-white">
        <p className="text-[13px] font-medium opacity-80 mb-2">보유 총 자산</p>
        <p className="text-[28px] font-bold">{fmt(data.totalAsset)}</p>
        <p className={`text-[13px] font-medium mt-1 ${isPositive ? "text-red-300" : "text-blue-200"}`}>
          {isPositive ? "+" : ""}{fmt(data.totalProfit)} ({isPositive ? "+" : ""}{data.totalProfitRate.toFixed(2)}%)
        </p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p className="text-[13px] text-gray-400 font-medium mb-2">보유 현금</p>
        <p className="text-[22px] font-bold text-gray-900">{fmt(data.cash)}</p>
        <p className="text-[12px] text-gray-400 mt-1">투자원금 {fmt(data.investAmount)}</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p className="text-[13px] text-gray-400 font-medium mb-2">보유 종목</p>
        <p className="text-[22px] font-bold text-gray-900">{data.holdingCount}개</p>
        <p className="text-[12px] text-gray-400 mt-1">총 평가가 {fmt(data.evaluationAmount)}</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p className="text-[13px] text-gray-400 font-medium mb-2">수익률</p>
        <p className={`text-[22px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
          {isPositive ? "+" : ""}{data.totalProfitRate.toFixed(2)}%
        </p>
        <p className={`text-[12px] mt-1 font-medium ${isPositive ? "text-red-400" : "text-blue-400"}`}>
          {isPositive ? "+" : ""}{fmt(data.totalProfit)}
        </p>
      </div>
    </div>
  );
}
