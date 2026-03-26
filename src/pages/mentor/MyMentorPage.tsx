import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, Loader2, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import MentorTradeDiaryTab from "@/components/profile/MentorTradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import { useUserProfileQuery, useMentorHoldingsQuery, useMentorDiariesQuery, useMentorTradeHistoryQuery } from "@/api/mentorApi";
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

function CancelMentorModal({ mentorNickname, onClose, onConfirm }: { mentorNickname: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[360px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-[15px] font-bold text-gray-900">멘토 취소</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-[14px] text-gray-700 font-medium mb-1"><span className="font-bold text-[#0046FF]">{mentorNickname}</span> 멘토를 취소하시겠어요?</p>
          <p className="text-[13px] text-gray-400">멘토 취소 후에도 다시 신청할 수 있어요.</p>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <Button variant="invalid" className="flex-1 py-2.5" onClick={onClose}>취소</Button>
          <Button variant="danger" className="flex-1 py-2.5" onClick={onConfirm}>멘토 취소</Button>
        </div>
      </div>
    </div>
  );
}

export default function MyMentorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const mentorId = 10;
  const { data: mentor, isLoading: loadingMentor } = useUserProfileQuery(mentorId);
  const { data: summary } = useAccountSummaryByUserQuery(mentorId);
  const { data: holdingsRaw = [] } = useMentorHoldingsQuery(mentorId);
  const { data: diaries = [] } = useMentorDiariesQuery(mentorId);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(mentorId);

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

  if (loadingMentor) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex flex-col h-screen p-6 gap-5 bg-gray-50">
        <h1 className="text-[22px] font-bold text-gray-900">나의 멘토</h1>
        <div className="flex-1 flex items-center justify-center text-[14px] text-gray-400">
          아직 멘토가 없습니다.
        </div>
      </div>
    );
  }

  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  return (
    <div className="flex flex-col h-screen p-6 gap-5 overflow-hidden bg-gray-50">
      {showCancelModal && (
        <CancelMentorModal
          mentorNickname={mentor.nickname}
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => {
            // TODO: 멘토 취소 API 연동
            setShowCancelModal(false);
          }}
        />
      )}
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

          {/* 버튼 */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="basic" className="px-4 py-2 text-[13px]" onClick={() => navigate(`/users/${mentor.userId}`)}>
              프로필 보기
            </Button>
            <Button variant="danger" className="px-4 py-2 text-[13px] flex items-center gap-1.5" onClick={() => setShowCancelModal(true)}>
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
          {activeTab === "diary" && (
            <MentorTradeDiaryTab
              items={diaries}
              onAskQuestion={async (diaryId, content) => {
                // TODO: 질문 API 연동
                console.log("질문 등록:", diaryId, content);
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
