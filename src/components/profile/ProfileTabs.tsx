import { useState } from "react";
import TabBar from "@/components/ui/TabBar";
import PortfolioTab from "@/components/profile/PortfolioTab";

const TABS = [
  { id: "portfolio", label: "포트폴리오" },
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
];

const DUMMY_PORTFOLIO = [
  { stockName: "KB금융", ratio: 17 },
  { stockName: "삼성SDI", ratio: 14 },
  { stockName: "NAVER", ratio: 13 },
  { stockName: "현대차", ratio: 11 },
  { stockName: "삼성물산", ratio: 8 },
  { stockName: "기타", ratio: 37 },
];

const DUMMY_HOLDINGS = [
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

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("portfolio");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      <TabBar
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      <div className="p-6">
        {activeTab === "diary" && (
          <div className="text-[14px] text-gray-400">매매일지 준비 중</div>
        )}
        {activeTab === "history" && (
          <div className="text-[14px] text-gray-400">매매내역 준비 중</div>
        )}
        {activeTab === "portfolio" && (
          <PortfolioTab
            totalEvaluation={11250000}
            totalReturnRate={12.5}
            totalReturnAmount={1250000}
            portfolio={DUMMY_PORTFOLIO}
            holdings={DUMMY_HOLDINGS}
          />
        )}
      </div>
    </div>
  );
}
