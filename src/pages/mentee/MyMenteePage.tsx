import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Loader2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import MenteeTradeDiaryTab from "@/components/profile/MenteeTradeDiaryTab";
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

// ─── Mentee Detail Panel ──────────────────────────────────────────────────────

function MenteeDetail({ menteeId }: { menteeId: number }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");

  const { data: mentee, isLoading } = useUserProfileQuery(menteeId);
  const { data: summary } = useAccountSummaryByUserQuery(menteeId);
  const { data: holdingsRaw = [] } = useMentorHoldingsQuery(menteeId);
  const { data: diaries = [] } = useMentorDiariesQuery(menteeId);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(menteeId);

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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!mentee) return null;

  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      {/* 멘티 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar name={mentee.nickname} src={mentee.imageUrl || undefined} size={52} />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-gray-900">{mentee.nickname}</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">멘티</span>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-gray-400" />
                  <span>팔로워</span>
                  <span className="font-semibold text-gray-700 ml-0.5">{mentee.followerCount.toLocaleString()}명</span>
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
          <Button
            variant="basic"
            className="px-4 py-2 text-[13px] shrink-0"
            onClick={() => navigate(`/users/${mentee.userId}`)}
          >
            프로필 보기
          </Button>
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
          {activeTab === "diary" && (
            <MenteeTradeDiaryTab
              items={diaries}
              onFeedback={async (diaryId, content) => {
                // TODO: 피드백 API 연동
                console.log("피드백 등록:", diaryId, content);
              }}
            />
          )}
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MENTEE_IDS = [1, 5, 6];

// ─── Mentee List Item ─────────────────────────────────────────────────────────

function MenteeListItem({
  userId,
  selected,
  onClick,
}: {
  userId: number;
  selected: boolean;
  onClick: () => void;
}) {
  const { data: profile } = useUserProfileQuery(userId);
  const { data: summary } = useAccountSummaryByUserQuery(userId);
  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
        selected ? "bg-[#0046FF]/8" : "hover:bg-gray-50"
      }`}
    >
      <Avatar name={profile?.nickname ?? ""} src={profile?.imageUrl || undefined} size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{profile?.nickname ?? "..."}</p>
        <p className={`text-[12px] font-semibold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
          {isPositive ? "+" : ""}{(summary?.totalReturnRate ?? 0).toFixed(1)}%
        </p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyMenteePage() {
  const [selectedId, setSelectedId] = useState<number>(MOCK_MENTEE_IDS[0]);

  return (
    <div className="flex flex-col h-screen p-6 gap-5 overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-baseline gap-2 shrink-0">
        <h1 className="text-[22px] font-bold text-gray-900">나의 멘티</h1>
        <span className="text-[13px] text-gray-400">총 {MOCK_MENTEE_IDS.length}명의 멘티</span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* 멘티 목록 (좌측) */}
        <div className="w-[180px] shrink-0 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <p className="text-[12px] font-semibold text-gray-400">멘티 목록</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {MOCK_MENTEE_IDS.map((id) => (
              <MenteeListItem
                key={id}
                userId={id}
                selected={id === selectedId}
                onClick={() => setSelectedId(id)}
              />
            ))}
          </div>
        </div>

        {/* 멘티 상세 (우측) */}
        <MenteeDetail key={selectedId} menteeId={selectedId} />
      </div>
    </div>
  );
}
