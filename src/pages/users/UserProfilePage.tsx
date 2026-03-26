import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, TrendingUp, Loader2, ChevronLeft } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import {
  useUserProfileQuery,
  useMentorHoldingsQuery,
  useMentorDiariesQuery,
  useMentorTradeHistoryQuery,
} from "@/api/mentorApi";
import { useAccountSummaryByUserQuery } from "@/api/accountSummaryApi";

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

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("diary");

  const id = Number(userId);
  const { data: profile, isLoading } = useUserProfileQuery(id);
  const { data: summary } = useAccountSummaryByUserQuery(id);
  const { data: holdingsRaw = [] } = useMentorHoldingsQuery(id);
  const { data: diaries = [] } = useMentorDiariesQuery(id);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(id);

  const holdings = holdingsRaw.map((h) => ({
    tickerCode: h.tickerCode,
    stockName: h.stockName,
    stockLogo: h.stockLogo,
    quantity: h.quantity,
    averageBuyPrice: 0,
    currentPrice: h.currentPrice,
    evaluationAmount: h.evaluation,
    profitRate: h.returnRate,
    profitAmount: h.returnAmount,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-screen p-6 gap-5 bg-gray-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700 w-fit">
          <ChevronLeft size={16} />
          뒤로
        </button>
        <div className="flex-1 flex items-center justify-center text-[14px] text-gray-400">
          유저를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  return (
    <div className="flex flex-col h-screen p-6 gap-5 overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[22px] font-bold text-gray-900">{profile.nickname}</h1>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar name={profile.nickname} src={profile.imageUrl || undefined} size={52} />
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-bold text-gray-900">{profile.nickname}</span>
              <div className="flex items-center gap-4 text-[13px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-gray-400" />
                  <span>팔로워</span>
                  <span className="font-semibold text-gray-700 ml-0.5">{profile.followerCount.toLocaleString()}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-gray-400" />
                  <span>총 수익률</span>
                  <span className={`font-bold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}>
                    {isPositive ? "+" : ""}{(summary?.totalReturnRate ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>총 수익</span>
                  <span className={`font-bold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}>
                    {isPositive ? "+" : ""}{fmtAmount(summary?.totalReturnAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {profile.following ? (
              <Button variant="invalid" className="px-4 py-2 text-[13px]">팔로잉</Button>
            ) : (
              <Button variant="primary" className="px-4 py-2 text-[13px]">팔로우</Button>
            )}
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
          {activeTab === "diary" && <TradeDiaryTab items={diaries} />}
          {activeTab === "history" && <TradeHistoryTab items={tradeHistories} />}
          {activeTab === "portfolio" && (
            <PortfolioTab
              totalEvaluation={summary?.totalEvaluation ?? 0}
              totalReturnRate={summary?.totalReturnRate ?? 0}
              totalReturnAmount={summary?.totalReturnAmount ?? 0}
              portfolio={summary?.holdingsRatio ?? []}
              holdings={holdings}
              compact={false}
              showAvgPrice={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
