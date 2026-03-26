import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MENTOR = {
  userId: 10,
  nickname: "주식마스터",
  imageUrl: "",
  followerCount: 542,
  totalReturnRate: 48.3,
  totalReturnAmount: 18500000,
};

const MOCK_PORTFOLIO = [
  { tickerCode: "005930", name: "삼성전자", ratio: 30 },
  { tickerCode: "000660", name: "SK하이닉스", ratio: 20 },
  { tickerCode: "035420", name: "NAVER", ratio: 18 },
  { tickerCode: "005380", name: "현대차", ratio: 17 },
  { tickerCode: "105560", name: "KB금융", ratio: 15 },
];

const MOCK_HOLDINGS = [
  { tickerCode: "005930", stockName: "삼성전자", stockLogo: "", quantity: 15, averageBuyPrice: 0, currentPrice: 73400, evaluationAmount: 1101000, profitRate: 7.62, profitAmount: 78000 },
  { tickerCode: "000660", stockName: "SK하이닉스", stockLogo: "", quantity: 5, averageBuyPrice: 0, currentPrice: 192500, evaluationAmount: 962500, profitRate: 10.63, profitAmount: 92500 },
  { tickerCode: "035420", stockName: "NAVER", stockLogo: "", quantity: 12, averageBuyPrice: 0, currentPrice: 178000, evaluationAmount: 2136000, profitRate: 7.87, profitAmount: 156800 },
  { tickerCode: "005380", stockName: "현대차", stockLogo: "", quantity: 8, averageBuyPrice: 0, currentPrice: 241500, evaluationAmount: 1932000, profitRate: 7.33, profitAmount: 132000 },
  { tickerCode: "105560", stockName: "KB금융", stockLogo: "", quantity: 35, averageBuyPrice: 0, currentPrice: 87200, evaluationAmount: 3052000, profitRate: 9.04, profitAmount: 253000 },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
  { id: "portfolio", label: "포트폴리오" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function fmtAmount(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyMentorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");
  const mentor = MOCK_MENTOR;
  const isPositive = mentor.totalReturnRate >= 0;

  return (
    <div className="flex flex-col h-screen p-6 gap-5 overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">나의 멘토</h1>
      </div>

      {/* 멘토 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* 아바타 + 닉네임 + 통계 */}
          <div className="flex items-center gap-3 flex-1">
            <Avatar name={mentor.nickname} src={mentor.imageUrl || undefined} size={52} />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-gray-900">{mentor.nickname}</span>
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">멘토</span>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-gray-400" />
                  <span>팔로워</span>
                  <span className="font-semibold text-gray-700 ml-0.5">{mentor.followerCount.toLocaleString()}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-gray-400" />
                  <span>총 수익률</span>
                  <span className={`font-bold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}>
                    {isPositive ? "+" : ""}{mentor.totalReturnRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>총 수익</span>
                  <span className={`font-bold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}>
                    {isPositive ? "+" : ""}{fmtAmount(mentor.totalReturnAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="basic" className="px-4 py-2 text-[13px]" onClick={() => navigate(`/users/${mentor.userId}`)}>
              프로필 보기
            </Button>
            <Button variant="danger" className="px-4 py-2 text-[13px] flex items-center gap-1.5">
              <Users size={13} />
              멘토 취소
            </Button>
          </div>
        </div>
      </div>

      {/* 탭 + 콘텐츠 */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
        <UnderlineTabBar
          tabs={[...TABS]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
        <div className={`p-5 flex-1 min-h-0 ${activeTab !== "portfolio" ? "overflow-y-auto" : "overflow-hidden"}`}>
          {activeTab === "diary" && <TradeDiaryTab items={[]} />}
          {activeTab === "history" && <TradeHistoryTab items={[]} />}
          {activeTab === "portfolio" && (
            <PortfolioTab
              totalEvaluation={9183500}
              totalReturnRate={12.5}
              totalReturnAmount={1250000}
              portfolio={MOCK_PORTFOLIO}
              holdings={MOCK_HOLDINGS}
              compact={false}
              showAvgPrice={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
