import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import TabBar from "@/components/ui/TabBar";
import ProfileCard from "@/components/profile/ProfileCard";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import type { TradeDiaryItem } from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import type { TradeHistoryItem } from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import type { PortfolioData } from "@/components/profile/PortfolioTab";

const TABS = [
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
  { id: "portfolio", label: "포트폴리오" },
];

// TODO: API 연동 후 제거
const DUMMY_DIARIES: TradeDiaryItem[] = [];
const DUMMY_HISTORIES: TradeHistoryItem[] = [];
const DUMMY_PORTFOLIO: PortfolioData = {
  totalValue: 0,
  totalProfitLoss: 0,
  totalProfitLossRate: 0,
  holdings: [],
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useUser();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [activeTab, setActiveTab] = useState("diary");

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
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 프로필</h1>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* 왼쪽: 프로필 카드 */}
        <div className="col-span-1">
          <ProfileCard
            nickname={user.nickname}
            followers={0}
            following={0}
            totalReturnRate={0}
            totalReturn={0}
            onEditClick={() => {}}
            onLogoutClick={handleLogout}
            onDeleteClick={() => {}}
            onFollowersClick={() => {}}
            onFollowingClick={() => {}}
          />
        </div>

        {/* 오른쪽: 탭 + 콘텐츠 */}
        <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <TabBar tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

          {activeTab === "diary" && <TradeDiaryTab items={DUMMY_DIARIES} />}
          {activeTab === "history" && <TradeHistoryTab items={DUMMY_HISTORIES} />}
          {activeTab === "portfolio" && <PortfolioTab data={DUMMY_PORTFOLIO} />}
        </div>
      </div>
    </div>
  );
}
