import SummaryCard from "@/components/account/SummaryCard";
import PortfolioChart from "@/components/account/PortfolioChart";
import HoldingList from "@/components/account/HoldingList";
import type { PortfolioItem } from "@/components/account/PortfolioChart";
import type { HoldingItem } from "@/components/account/HoldingList";

const DUMMY_PORTFOLIO: PortfolioItem[] = [
  { stockName: "KB금융", ratio: 35 },
  { stockName: "NAVER", ratio: 20 },
  { stockName: "현대차", ratio: 17 },
  { stockName: "SK하이닉스", ratio: 9 },
  { stockName: "삼성전자", ratio: 10 },
  { stockName: "셀트리온", ratio: 6 },
];

const DUMMY_HOLDINGS: HoldingItem[] = [
  { tickerCode: "005930", stockName: "삼성전자", stockLogo: "", quantity: 15, averageBuyPrice: 68200, currentPrice: 73400, evaluationAmount: 1100000, profitRate: 7.62, profitAmount: 78000 },
  { tickerCode: "000660", stockName: "SK하이닉스", stockLogo: "", quantity: 5, averageBuyPrice: 174000, currentPrice: 192500, evaluationAmount: 962500, profitRate: 10.63, profitAmount: 92500 },
  { tickerCode: "035420", stockName: "NAVER", stockLogo: "", quantity: 12, averageBuyPrice: 178000, currentPrice: 192000, evaluationAmount: 2304000, profitRate: 7.87, profitAmount: 168000 },
  { tickerCode: "005380", stockName: "현대차", stockLogo: "", quantity: 8, averageBuyPrice: 225000, currentPrice: 241500, evaluationAmount: 1932000, profitRate: 7.33, profitAmount: 132000 },
  { tickerCode: "105560", stockName: "KB금융", stockLogo: "", quantity: 35, averageBuyPrice: 81500, currentPrice: 87200, evaluationAmount: 3052000, profitRate: 9.04, profitAmount: 253000 },
  { tickerCode: "068270", stockName: "셀트리온", stockLogo: "", quantity: 4, averageBuyPrice: 162000, currentPrice: 178500, evaluationAmount: 714000, profitRate: 10.19, profitAmount: 66000 },
];

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

const totalAsset = 11250000;
const totalProfit = 1250000;
const totalProfitRate = 12.5;
const isPositive = totalProfit >= 0;

export default function AccountPage() {
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 계좌</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">나의 투자 현황을 한눈에 확인하세요</p>
      </div>

      {/* grid: [2fr 1fr 1fr 1fr] — 상단 요약 + 하단 차트/테이블 정렬 */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-stretch">

        <SummaryCard
          label="보유 총 자산"
          value={fmt(totalAsset)}
          sub={`${isPositive ? "+" : ""}${fmt(totalProfit)} (${isPositive ? "+" : ""}${totalProfitRate.toFixed(2)}%)`}
          variant="blue"
          subColor={isPositive ? "text-red-300" : "text-blue-200"}
        />
        <SummaryCard
          label="보유 현금"
          value={fmt(2140000)}
          sub={`투자원금 ${fmt(10000000)}`}
        />
        <SummaryCard
          label="보유 종목"
          value="6개"
          sub={`총 평가가 ${fmt(9110000)}`}
        />
        <SummaryCard
          label="수익률"
          value={`${isPositive ? "+" : ""}${totalProfitRate.toFixed(2)}%`}
          sub={`${isPositive ? "+" : ""}${fmt(totalProfit)}`}
          valueColor={isPositive ? "text-red-500" : "text-blue-500"}
          subColor={isPositive ? "text-red-400" : "text-blue-400"}
        />

        {/* 종목 비중 차트 — col 1 (2fr) */}
        <div className="row-start-2">
          <PortfolioChart items={DUMMY_PORTFOLIO} />
        </div>

        {/* 보유 종목 테이블 — col 2~4 (3fr) */}
        <div className="col-span-3 row-start-2">
          <HoldingList items={DUMMY_HOLDINGS} />
        </div>
      </div>
    </div>
  );
}
