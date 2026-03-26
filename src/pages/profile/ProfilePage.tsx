import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import { useMyDiariesQuery } from "@/api/tradeDiaryApi";
import { useTradeHistoryQuery } from "@/api/tradeApi";
import { useAccountSummaryQuery, useHoldingsQuery } from "@/api/accountApi";
import ProfileCard from "@/components/profile/ProfileCard";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import TradeDiaryTab from "@/components/profile/TradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";

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
  const [activeTab, setActiveTab] = useState<TabId>("diary");
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
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">내 프로필</h1>
      </div>

      <div className="flex gap-5 items-start">
        {/* 왼쪽: 프로필 카드 */}
        <div className="w-64 shrink-0">
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
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          {/* 탭 바 */}
          <UnderlineTabBar
            tabs={[...TABS]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
          />

          {/* 탭 콘텐츠 */}
          <div className={`p-5 h-[600px] ${activeTab !== "portfolio" ? "overflow-y-auto" : ""}`}>
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
    </div>
  );
}
