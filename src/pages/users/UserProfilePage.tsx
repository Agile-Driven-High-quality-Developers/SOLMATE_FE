import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ProfileCard from "@/components/profile/ProfileCard";
import FollowList from "@/components/profile/FollowList";
import {
  useUserProfileQuery,
  useMentorHoldingsQuery,
  useMentorDiariesQuery,
  useMentorTradeHistoryQuery,
  useMyMenteesQuery,
  useMyMentorQuery,
} from "@/api/mentorApi";
import { useAccountSummaryByUserQuery } from "@/api/accountSummaryApi";
import { followUser, unfollowUser } from "@/api/userListApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
  { id: "portfolio", label: "포트폴리오" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("diary");
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>("following");

  const id = Number(userId);
  const { data: profile, isLoading } = useUserProfileQuery(id);
  const { data: summary } = useAccountSummaryByUserQuery(id);
  const { data: holdingsRaw = [] } = useMentorHoldingsQuery(id);
  const { data: diaries = [] } = useMentorDiariesQuery(id);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(id);
  const { data: myMentor } = useMyMentorQuery();
  const { data: myMentees } = useMyMenteesQuery();

  const holdings = holdingsRaw.filter((h) => h.quantity > 0).map((h) => ({
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

  const isMentor = myMentor?.hasMentor && myMentor.userId === id;
  const isMentee = myMentees?.mentees.some((m) => m.userId === id);

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
    <div className="flex flex-col h-screen p-6 gap-5 overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* 헤더 */}
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-gray-100">{profile.nickname}</h1>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* 왼쪽: 프로필 카드 + 팔로워/팔로잉 목록 */}
        <div className="w-64 shrink-0 overflow-y-auto h-full flex flex-col">
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
          />
          {followModal && (
            <FollowList type={followModal} userId={id} />
          )}
        </div>

        {/* 오른쪽: 탭 + 콘텐츠 */}
        <div className="flex-1 min-w-0 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
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
    </div>
  );
}
