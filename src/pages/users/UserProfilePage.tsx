import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ProfileCard from "@/components/profile/ProfileCard";
import FollowList from "@/components/profile/FollowList";
import {
  useUserProfileQuery,
  useRealtimeMentorHoldings,
  useMentorDiariesQuery,
  useMentorTradeHistoryQuery,
  useMyMenteesQuery,
  useMyMentorQuery,
} from "@/api/mentorApi";
import { useAccountSummaryByUserQuery } from "@/api/accountSummaryApi";
import { followUser, unfollowUser, requestMentoring, cancelMentoring, cancelPendingMentoring } from "@/api/userListApi";
import { notificationQueryKeys } from "@/api/notificationApi";
import Button from "@/components/ui/Button";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "portfolio", label: "포트폴리오" },
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("portfolio");
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>("following");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPendingCancelModal, setShowPendingCancelModal] = useState(false);

  const id = Number(userId);
  const { data: profile, isLoading } = useUserProfileQuery(id);
  const { data: summary } = useAccountSummaryByUserQuery(id);
  const { holdings: holdingsRaw } = useRealtimeMentorHoldings(id);
  const { data: diaries = [] } = useMentorDiariesQuery(id);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(id);
  const { data: myMentor } = useMyMentorQuery();
  const { data: myMentees } = useMyMenteesQuery();

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

  const realtimeTotalEvaluation = holdingsRaw.reduce((sum, h) => sum + h.evaluation, 0);
  const realtimeTotalAsset = (summary?.cash ?? 0) + realtimeTotalEvaluation;
  const realtimeTotalReturnAmount = realtimeTotalAsset - (summary?.initialCash ?? 0);
  const realtimeTotalReturnRate = (summary?.initialCash ?? 0) > 0
    ? (realtimeTotalReturnAmount / (summary?.initialCash ?? 1)) * 100
    : (summary?.totalReturnRate ?? 0);
  const realtimeHoldingsRatio = realtimeTotalEvaluation > 0
    ? holdingsRaw.map((h) => ({
        tickerCode: h.tickerCode,
        stockName: h.stockName,
        evaluation: h.evaluation,
        ratio: (h.evaluation / realtimeTotalEvaluation) * 100,
      }))
    : (summary?.holdingsRatio ?? []);

  const isMentor = myMentor?.hasMentor && myMentor.userId === id;
  const isMentee = myMentees?.mentees.some((m) => m.userId === id);
  const hasAcceptedMentor = myMentor?.hasMentor ?? false;
  const mentoringStatus = (profile?.mentoringStatus ?? "NONE") as "NONE" | "PENDING" | "ACCEPTED";

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.following) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["follows", id, "followers"] });
      queryClient.invalidateQueries({ queryKey: ["follows", "following"] });
    } catch (e) {
      // 실패 시 무시
    }
  };

  const handleMentoringRequest = async () => {
    try {
      await requestMentoring(id);
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["mentor"] });
    } catch {
      // 실패 시 무시
    }
  };

  const handleMentoringCancel = async () => {
    try {
      await cancelMentoring(id);
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["mentor"] });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
      setShowCancelModal(false);
    } catch {
      // 실패 시 무시
    }
  };

  const handlePendingMentoringCancel = async () => {
    try {
      await cancelPendingMentoring(id);
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["mentor"] });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
      setShowPendingCancelModal(false);
    } catch {
      // 실패 시 무시
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-screen p-6 gap-5 bg-gray-50 dark:bg-slate-950">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[14px] text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 w-fit">
          <ChevronLeft size={16} />
          뒤로
        </button>
        <div className="flex-1 flex items-center justify-center text-[14px] text-gray-400 dark:text-slate-500">
          유저를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 gap-5 min-h-screen md:h-screen md:overflow-hidden bg-gray-50 dark:bg-slate-950">
      {showPendingCancelModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" onClick={() => setShowPendingCancelModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-[360px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">신청 취소</p>
              <button onClick={() => setShowPendingCancelModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
                <span className="font-semibold text-[#0046FF]">{profile?.nickname}</span> 멘토 신청을 취소하시겠어요?
              </p>
              <p className="text-[12px] text-gray-400 dark:text-slate-500">취소 후에도 다시 신청할 수 있어요.</p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <Button variant="invalid" className="flex-1 py-2.5" onClick={() => setShowPendingCancelModal(false)}>닫기</Button>
              <Button variant="danger" className="flex-1 py-2.5" onClick={handlePendingMentoringCancel}>신청 취소</Button>
            </div>
          </div>
        </div>
      )}
      {showCancelModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-[360px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">멘토 취소</p>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
                <span className="font-semibold text-[#0046FF]">{profile.nickname}</span> 멘토를 취소하시겠어요?
              </p>
              <p className="text-[12px] text-gray-400 dark:text-slate-500">멘토 취소 후에도 다시 신청할 수 있어요.</p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <Button variant="invalid" className="flex-1 py-2.5" onClick={() => setShowCancelModal(false)}>닫기</Button>
              <Button variant="danger" className="flex-1 py-2.5" onClick={handleMentoringCancel}>멘토 취소</Button>
            </div>
          </div>
        </div>
      )}
      {/* 헤더 */}
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100">{profile.nickname}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-5 flex-1 md:min-h-0">
        {/* 왼쪽: 프로필 카드 + 팔로워/팔로잉 목록 */}
        <div className="w-full md:w-64 md:shrink-0 md:overflow-y-auto md:h-full flex flex-col">
          <ProfileCard
            isOwnProfile={false}
            isFollowing={profile.following}
            onFollowClick={handleFollow}
            nickname={profile.nickname}
            profileImageUrl={profile.imageUrl}
            followers={profile.followerCount}
            following={profile.followingCount}
            totalReturnRate={summary?.totalReturnRate ?? 0}
            totalReturn={summary?.totalReturnAmount ?? 0}
            onFollowersClick={() => setFollowModal("followers")}
            onFollowingClick={() => setFollowModal("following")}
            badge={isMentor ? "멘토" : isMentee ? "멘티" : undefined}
            mentoringStatus={profile.me ? undefined : mentoringStatus}
            hasAcceptedMentor={hasAcceptedMentor}
            onMentoringRequest={handleMentoringRequest}
            onMentoringCancel={() => setShowCancelModal(true)}
            onPendingCancelRequest={() => setShowPendingCancelModal(true)}
          />
          {followModal && (
            <FollowList type={followModal} userId={id} className="max-h-64 md:max-h-none md:flex-1" />
          )}
        </div>

        {/* 모바일 전용: 포트폴리오 섹션 (탭에서 분리) */}
        <div className="md:hidden">
          <PortfolioTab
            totalEvaluation={realtimeTotalEvaluation || (summary?.totalEvaluation ?? 0)}
            totalReturnRate={realtimeTotalReturnRate}
            totalReturnAmount={realtimeTotalReturnAmount || (summary?.totalReturnAmount ?? 0)}
            portfolio={realtimeHoldingsRatio}
            holdings={holdings}
            compact={false}
            showAvgPrice={false}
          />
        </div>

        {/* 오른쪽: 탭 + 콘텐츠 */}
        <div className="flex-1 min-w-0 md:min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
          {/* 데스크탑: 포트폴리오 포함 전체 탭 */}
          <div className="hidden md:block">
            <UnderlineTabBar
              tabs={[...TABS]}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as TabId)}
            />
          </div>
          {/* 모바일: 매매일지 + 매매내역만 */}
          <div className="md:hidden">
            <UnderlineTabBar
              tabs={TABS.filter((t) => t.id !== "portfolio")}
              activeId={activeTab === "portfolio" ? "diary" : activeTab}
              onChange={(id) => setActiveTab(id as TabId)}
            />
          </div>
          <div className={`p-5 flex-1 md:min-h-0 ${activeTab === "portfolio" ? "md:overflow-hidden overflow-y-auto" : "overflow-y-auto"}`}>
            {activeTab === "diary" && <TradeDiaryTab items={diaries} />}
            {activeTab === "history" && <TradeHistoryTab items={tradeHistories} />}
            {/* 모바일에서 activeTab이 portfolio인 경우 diary 콘텐츠로 폴백 */}
            {activeTab === "portfolio" && <div className="md:hidden"><TradeDiaryTab items={diaries} /></div>}
            {activeTab === "portfolio" && (
              <div className="hidden md:block h-full">
                <PortfolioTab
                  totalEvaluation={realtimeTotalEvaluation || (summary?.totalEvaluation ?? 0)}
                  totalReturnRate={realtimeTotalReturnRate}
                  totalReturnAmount={realtimeTotalReturnAmount || (summary?.totalReturnAmount ?? 0)}
                  portfolio={realtimeHoldingsRatio}
                  holdings={holdings}
                  compact={false}
                  showAvgPrice={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
