import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const PROFILE_TOUR: TourStep[] = [
  {
    target: "profile-card",
    title: "👤 내 프로필",
    description: "나의 투자 활동 기록이 쌓이는 공간이에요.",
    items: [
      "팔로워·팔로잉 — 서로 구독한 투자자 수",
      "수익률 — 지금까지의 내 총 투자 성과",
    ],
    placement: "right",
  },
  {
    target: "profile-tabs",
    title: "📂 내 기록 보기",
    description: "투자 관련 기록을 탭별로 확인할 수 있어요.",
    items: [
      "매매일지 — 거래할 때 남긴 메모 모음",
      "매매내역 — 지금까지의 모든 거래 기록",
      "포트폴리오 — 보유 종목 비중 파이 차트",
    ],
    placement: "left",
  },
];
import { useUser } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import { useMyDiariesQuery } from "@/api/tradeDiaryApi";
import { useTradeHistoryQuery } from "@/api/tradeApi";
import { useAccountSummaryQuery, useHoldingsQuery } from "@/api/accountApi";
import { useMyProfileQuery } from "@/api/userListApi";
import ProfileCard from "@/components/profile/ProfileCard";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import FollowList from "@/components/profile/FollowList";
import EditProfileModal from "@/components/profile/EditProfileModal";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import LogoutModal from "@/components/profile/LogoutModal";

const TABS = [
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
  { id: "portfolio", label: "포트폴리오" },
] as const;

type TabId = (typeof TABS)[number]["id"];


export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useUser();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const location = useLocation();
  const initialTab = (location.state as { tab?: TabId } | null)?.tab ?? "diary";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>("following");
  const [modal, setModal] = useState<"edit" | "logout" | "delete" | null>(null);
  const { data: myProfile } = useMyProfileQuery();
  const { data: diaries = [] } = useMyDiariesQuery();
  const { data: tradeHistories = [] } = useTradeHistoryQuery();
  const { data: summary } = useAccountSummaryQuery();
  const { data: holdingsRaw = [] } = useHoldingsQuery();

  const holdings = holdingsRaw.map((h) => ({
    tickerCode: h.tickerCode,
    stockName: h.stockName,
    stockLogo: h.stockLogo,
    quantity: h.quantity,
    averageBuyPrice: h.avgPrice,
    currentPrice: h.currentPrice,
    evaluationAmount: h.evaluation,
    profitRate: h.returnRate,
    profitAmount: h.returnAmount,
  }));

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen p-6 gap-5 overflow-hidden bg-gray-50">
      {modal === "edit" && (
        <EditProfileModal
          nickname={myProfile?.nickname ?? user.nickname}
          profileImageUrl={myProfile?.imageUrl}
          onClose={() => setModal(null)}
          onSave={(newNickname) => useAuthStore.getState().setAuth(useAuthStore.getState().accessToken!, { nickname: newNickname })}
        />
      )}
      {modal === "logout" && (
        <LogoutModal onClose={() => setModal(null)} onConfirm={handleLogout} />
      )}
      {modal === "delete" && (
        <DeleteAccountModal
          onClose={() => setModal(null)}
          onDeleted={() => { clearAuth(); navigate("/login"); }}
        />
      )}
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 프로필</h1>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* 왼쪽: 프로필 카드 */}
        <div className="w-64 shrink-0 overflow-y-auto h-full flex flex-col" data-tour="profile-card">
          <ProfileCard
            nickname={myProfile?.nickname ?? user.nickname}
            profileImageUrl={myProfile?.imageUrl}
            followers={myProfile?.followerCount ?? 0}
            following={myProfile?.followingCount ?? 0}
            totalReturnRate={summary?.totalReturnRate ?? 0}
            totalReturn={summary?.totalReturnAmount ?? 0}
            onEditClick={() => setModal("edit")}
            onLogoutClick={() => setModal("logout")}
            onDeleteClick={() => setModal("delete")}
            onFollowersClick={() => setFollowModal("followers")}
            onFollowingClick={() => setFollowModal("following")}
          />
          {followModal && (
            <FollowList type={followModal} />
          )}
        </div>

        {/* 오른쪽: 탭 + 콘텐츠 */}
        <div className="flex-1 min-w-0 min-h-0 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" data-tour="profile-tabs">
          {/* 탭 바 */}
          <UnderlineTabBar
            tabs={[...TABS]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
          />

          {/* 탭 콘텐츠 */}
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
              />
            )}
          </div>
        </div>
      </div>
      <SpotlightTour tourKey="profile" steps={PROFILE_TOUR} />
    </div>
  );
}
