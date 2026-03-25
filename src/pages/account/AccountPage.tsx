import AssetSummary from "@/components/account/AssetSummary";
import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import type { AssetSummaryData } from "@/components/account/AssetSummary";
import type { PortfolioItem } from "@/components/account/PortfolioChart";
import type { HoldingItem } from "@/components/account/HoldingList";

const DUMMY_SUMMARY: AssetSummaryData = {
  totalAsset: 11250000,
  totalProfit: 1250000,
  totalProfitRate: 12.5,
  cash: 2140000,
  investAmount: 10000000,
  holdingCount: 6,
  evaluationAmount: 9110000,
};

const DUMMY_PORTFOLIO: PortfolioItem[] = [
  { stockName: "KB금융", ratio: 35 },
  { stockName: "NAVER", ratio: 20 },
  { stockName: "현대차", ratio: 17 },
  { stockName: "SK하이닉스", ratio: 9 },
  { stockName: "삼성전자", ratio: 10 },
  { stockName: "셀트리온", ratio: 6 },
];

const DUMMY_HOLDINGS: HoldingItem[] = [
  {
    tickerCode: "005930",
    stockName: "삼성전자",
    stockLogo: "",
    quantity: 15,
    averageBuyPrice: 68200,
    currentPrice: 73400,
    evaluationAmount: 1100000,
    profitRate: 7.62,
    profitAmount: 78000,
  },
  {
    tickerCode: "000660",
    stockName: "SK하이닉스",
    stockLogo: "",
    quantity: 5,
    averageBuyPrice: 174000,
    currentPrice: 192500,
    evaluationAmount: 962500,
    profitRate: 10.63,
    profitAmount: 92500,
  },
  {
    tickerCode: "035420",
    stockName: "NAVER",
    stockLogo: "",
    quantity: 12,
    averageBuyPrice: 178000,
    currentPrice: 192000,
    evaluationAmount: 2304000,
    profitRate: 7.87,
    profitAmount: 168000,
  },
  {
    tickerCode: "005380",
    stockName: "현대차",
    stockLogo: "",
    quantity: 8,
    averageBuyPrice: 225000,
    currentPrice: 241500,
    evaluationAmount: 1932000,
    profitRate: 7.33,
    profitAmount: 132000,
  },
  {
    tickerCode: "105560",
    stockName: "KB금융",
    stockLogo: "",
    quantity: 35,
    averageBuyPrice: 81500,
    currentPrice: 87200,
    evaluationAmount: 3052000,
    profitRate: 9.04,
    profitAmount: 253000,
  },
  {
    tickerCode: "068270",
    stockName: "셀트리온",
    stockLogo: "",
    quantity: 4,
    averageBuyPrice: 162000,
    currentPrice: 178500,
    evaluationAmount: 714000,
    profitRate: 10.19,
    profitAmount: 66000,
  },
];

export default function AccountPage() {
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 계좌</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">나의 투자 현황을 한눈에 확인하세요</p>
      </div>

      <AssetSummary data={DUMMY_SUMMARY} />

      <div className="flex gap-5 items-start">
        <div className="w-64 shrink-0">
          <PortfolioChart items={DUMMY_PORTFOLIO} />
        </div>
        <div className="flex-1 min-w-0">
          <HoldingList items={DUMMY_HOLDINGS} />
        </div>
      </div>
    </div>
  );
}
