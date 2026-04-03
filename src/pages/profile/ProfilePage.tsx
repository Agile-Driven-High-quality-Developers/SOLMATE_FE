import { useState } from "react";
import { User, FolderOpen } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";
import { useQueryClient } from "@tanstack/react-query";
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

const PROFILE_TOUR: TourStep[] = [
  {
    target: "profile-card",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <User size={15} />내 프로필
      </span>
    ),
    description: "내 투자 정보와 활동을 한곳에서 확인할 수 있어요.",
    items: [
      "팔로워·팔로잉 — 나를 팔로우한 사람과 내가 팔로우한 사람 수",
      "수익률·총 수익 — 지금까지의 내 투자 성과",
      "프로필 편집 — 프로필 정보를 수정할 수 있어요.",
    ],
    placement: "right",
  },
  {
    target: "profile-tabs",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <FolderOpen size={15} />내 기록 보기
      </span>
    ),
    description: "투자 관련 기록을 탭별로 확인할 수 있어요.",
    items: [
      "포트폴리오 — 보유 종목 현황과 종목 비중",
      "매매일지 — 거래할 때 남긴 메모 모음",
      "매매내역 — 지금까지의 모든 거래 기록",
    ],
    placement: "left",
  },
];

const TABS = [
  { id: "portfolio", label: "포트폴리오" },
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useUser();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") ??
    (location.state as { tab?: TabId } | null)?.tab ??
    "portfolio") as TabId;
  const setActiveTab = (v: TabId) =>
    setSearchParams(
      (p) => {
        if (v === "portfolio") p.delete("tab");
        else p.set("tab", v);
        return p;
      },
      { replace: true },
    );
  const [followModal, setFollowModal] = useState<
    "followers" | "following" | null
  >("following");
  const [modal, setModal] = useState<"edit" | "logout" | "delete" | null>(null);
  const { data: myProfile } = useMyProfileQuery();
  const { data: diaries = [] } = useMyDiariesQuery();
  const { data: tradeHistories = [] } = useTradeHistoryQuery();
  const { data: summary } = useAccountSummaryQuery();
  const { data: holdingsRaw = [] } = useHoldingsQuery();

  const holdings = holdingsRaw
    .filter((h) => h.quantity > 0)
    .map((h) => ({
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

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      localStorage.removeItem("autoLogin");
      queryClient.clear();
      navigate("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col p-4 sm:p-6 gap-5 min-h-screen md:h-screen md:overflow-hidden bg-gray-50 dark:bg-slate-950">
      {modal === "edit" && (
        <EditProfileModal
          nickname={myProfile?.nickname ?? user.nickname}
          profileImageUrl={user.imageUrl ?? myProfile?.imageUrl}
          onClose={() => setModal(null)}
          onSave={(newNickname) =>
            useAuthStore.getState().updateUserProfile({ nickname: newNickname })
          }
        />
      )}
      {modal === "logout" && (
        <LogoutModal onClose={() => setModal(null)} onConfirm={handleLogout} />
      )}
      {modal === "delete" && (
        <DeleteAccountModal
          onClose={() => setModal(null)}
          onDeleted={() => {
            clearAuth();
            navigate("/login");
          }}
        />
      )}
      {/* 헤더 */}
      <div className="shrink-0">
        <h1 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100">
          내 프로필
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-5 flex-1 md:min-h-0">
        {/* 왼쪽: 프로필 카드 */}
        <div
          className="w-full md:w-64 md:shrink-0 md:overflow-y-auto md:h-full flex flex-col"
          data-tour="profile-card"
        >
          <ProfileCard
            nickname={myProfile?.nickname ?? user.nickname}
            profileImageUrl={user.imageUrl ?? myProfile?.imageUrl}
            followers={myProfile?.followerCount ?? 0}
            following={myProfile?.followingCount ?? 0}
            totalReturnRate={summary?.totalReturnRate ?? 0}
            totalReturn={summary?.totalReturnAmount ?? 0}
            onEditClick={() => setModal("edit")}
            onLogoutClick={() => setModal("logout")}
            onFollowersClick={() => setFollowModal("followers")}
            onFollowingClick={() => setFollowModal("following")}
          />
          {followModal && <FollowList type={followModal} />}
          <div
            className="cursor-pointer text-[12px] text-gray-500 py-2 px-1"
            onClick={() => setModal("delete")}
          >
            회원탈퇴
          </div>
        </div>

        {/* 모바일 전용: 포트폴리오 섹션 (탭에서 분리) */}
        <div className="md:hidden">
          <PortfolioTab
            totalEvaluation={summary?.totalEvaluation ?? 0}
            totalReturnRate={summary?.totalReturnRate ?? 0}
            totalReturnAmount={summary?.totalReturnAmount ?? 0}
            portfolio={summary?.holdingsRatio ?? []}
            holdings={holdings}
            compact={false}
          />
        </div>

        {/* 오른쪽: 탭 + 콘텐츠 */}
        <div
          className="flex-1 min-w-0 md:min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col"
          data-tour="profile-tabs"
        >
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

          {/* 탭 콘텐츠 */}
          <div
            className={`p-5 flex-1 md:min-h-0 ${activeTab === "portfolio" ? "md:overflow-hidden overflow-y-auto" : "overflow-y-auto"}`}
          >
            {activeTab === "diary" && <TradeDiaryTab items={diaries} />}
            {activeTab === "history" && (
              <TradeHistoryTab items={tradeHistories} />
            )}
            {/* 모바일에서 activeTab이 portfolio인 경우 diary 콘텐츠로 폴백 */}
            {activeTab === "portfolio" && (
              <div className="md:hidden">
                <TradeDiaryTab items={diaries} />
              </div>
            )}
            {activeTab === "portfolio" && (
              <div className="hidden md:block h-full">
                <PortfolioTab
                  totalEvaluation={summary?.totalEvaluation ?? 0}
                  totalReturnRate={summary?.totalReturnRate ?? 0}
                  totalReturnAmount={summary?.totalReturnAmount ?? 0}
                  portfolio={summary?.holdingsRatio ?? []}
                  holdings={holdings}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <SpotlightTour tourKey="profile" steps={PROFILE_TOUR} />
    </div>
  );
}
