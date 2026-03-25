import AssetSummary from "@/components/account/AssetSummary";
import type { AssetSummaryData } from "@/components/account/AssetSummary";

const DUMMY_SUMMARY: AssetSummaryData = {
  totalAsset: 11250000,
  totalProfit: 1250000,
  totalProfitRate: 12.5,
  cash: 2140000,
  investAmount: 10000000,
  holdingCount: 6,
  evaluationAmount: 9110000,
};

export default function AccountPage() {
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 계좌</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">나의 투자 현황을 한눈에 확인하세요</p>
      </div>

      <AssetSummary data={DUMMY_SUMMARY} />
    </div>
  );
}
