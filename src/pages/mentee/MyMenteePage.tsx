import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, Loader2, ClipboardList } from "lucide-react";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const MENTEE_TOUR: TourStep[] = [
  {
    target: "mentee-list",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Users size={15} />
        나의 멘티 목록
      </span>
    ),
    description: "나에게 멘토 신청을 한 투자자들이에요.",
    items: [
      "클릭하면 그 멘티의 투자 기록을 볼 수 있어요",
      "멘티의 수익률도 한눈에 확인할 수 있어요",
    ],
    placement: "right",
  },
  {
    target: "mentee-detail",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <ClipboardList size={15} />
        멘티의 투자 기록
      </span>
    ),
    description: "선택한 멘티가 어떻게 투자하고 있는지 확인할 수 있어요.",
    items: [
      "매매일지 — 멘티가 남긴 메모에 피드백을 줄 수 있어요",
      "매매내역 — 멘티의 거래 기록",
      "포트폴리오 — 멘티가 보유한 종목 현황",
    ],
    placement: "left",
  },
];
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import MenteeTradeDiaryTab from "@/components/profile/MenteeTradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import {
  useMyMenteesQuery,
  useUserProfileQuery,
  useMentorHoldingsQuery,
  useMentorDiariesQuery,
  useMentorTradeHistoryQuery,
} from "@/api/mentorApi";
import { useAccountSummaryByUserQuery } from "@/api/accountSummaryApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "portfolio", label: "포트폴리오" },
  { id: "diary", label: "매매일지" },
  { id: "history", label: "매매내역" },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? "portfolio") as TabId;
  const setActiveTab = (v: TabId) =>
    setSearchParams(
      (p) => {
        if (v === "portfolio") p.delete("tab");
        else p.set("tab", v);
        return p;
      },
      { replace: true },
    );

  const { data: mentee, isLoading } = useUserProfileQuery(menteeId);
  const { data: summary } = useAccountSummaryByUserQuery(menteeId);
  const { data: holdingsRaw = [] } = useMentorHoldingsQuery(menteeId);
  const { data: diaries = [] } = useMentorDiariesQuery(menteeId);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(menteeId);

  const holdings = holdingsRaw
    .filter((h) => h.quantity > 0)
    .map((h) => ({
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
    <div className="flex-1 flex flex-col gap-4 md:min-h-0">
      {/* 멘티 카드 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar
              name={mentee.nickname}
              src={mentee.imageUrl || undefined}
              size={52}
            />
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-gray-900 dark:text-gray-100">
                  {mentee.nickname}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                  멘티
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-gray-400" />
                  <span>팔로워</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">
                    {mentee.followerCount.toLocaleString()}명
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>총 수익률</span>
                  <span
                    className={`font-bold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}
                  >
                    {isPositive ? "+" : ""}
                    {(summary?.totalReturnRate ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>총 수익</span>
                  <span
                    className={`font-bold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}
                  >
                    {isPositive ? "+" : ""}
                    {fmtAmount(summary?.totalReturnAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="basic"
            className="sm:shrink-0 px-4 py-2 text-[13px]"
            onClick={() => navigate(`/users/${mentee.userId}`)}
          >
            프로필 보기
          </Button>
        </div>
      </div>

      {/* 탭 + 콘텐츠 */}
      <div className="flex-1 md:min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        <UnderlineTabBar
          tabs={[...TABS]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
        <div
          className={`p-5 flex-1 md:min-h-0 ${activeTab === "portfolio" ? "md:overflow-hidden overflow-y-auto" : "overflow-y-auto"}`}
        >
          {activeTab === "diary" && <MenteeTradeDiaryTab items={diaries} />}
          {activeTab === "history" && (
            <TradeHistoryTab items={tradeHistories} />
          )}
          {activeTab === "portfolio" && (
            <PortfolioTab
              totalEvaluation={summary?.totalEvaluation ?? 0}
              totalReturnRate={summary?.totalReturnRate ?? 0}
              totalReturnAmount={summary?.totalReturnAmount ?? 0}
              portfolio={summary?.holdingsRatio ?? []}
              holdings={holdings}
              compact={false}
              showAvgPrice={false}
              hideReturnStatsOnMobile
            />
          )}
        </div>
      </div>
    </div>
  );
}

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
  const { data: profile, isLoading: profileLoading } =
    useUserProfileQuery(userId);
  const { data: summary } = useAccountSummaryByUserQuery(userId);
  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  if (profileLoading) {
    return (
      <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-16" />
          <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full w-12" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
        selected
          ? "bg-[#0046FF]/8 dark:bg-[#0046FF]/15"
          : "hover:bg-gray-50 dark:hover:bg-slate-800"
      }`}
    >
      <Avatar
        name={profile?.nickname ?? ""}
        src={profile?.imageUrl || undefined}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">
          {profile?.nickname}
        </p>
        <p
          className={`text-[12px] font-semibold ${isPositive ? "text-red-500" : "text-blue-500"}`}
        >
          {isPositive ? "+" : ""}
          {(summary?.totalReturnRate ?? 0).toFixed(2)}%
        </p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyMenteePage() {
  const { data: menteesData, isLoading } = useMyMenteesQuery();
  const mentees = menteesData?.mentees ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("mentee")
    ? Number(searchParams.get("mentee"))
    : null;
  const setSelectedId = (id: number) =>
    setSearchParams(
      (p) => {
        p.set("mentee", String(id));
        return p;
      },
      { replace: true },
    );

  const activeMenteeId = selectedId ?? mentees[0]?.userId ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 gap-5 min-h-screen md:h-screen md:overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* 헤더 */}
      <div className="flex items-baseline gap-2 shrink-0">
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-gray-100">
          나의 멘티
        </h1>
        {mentees.length > 0 && (
          <span className="text-[13px] text-gray-400 dark:text-slate-500">
            총 {mentees.length}명의 멘티
          </span>
        )}
      </div>

      {!menteesData?.hasMentee || mentees.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[14px] text-gray-400">
          아직 멘티가 없습니다.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 flex-1 md:min-h-0">
          {/* 멘티 목록 */}
          <div
            className="w-full md:w-45 md:shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden"
            data-tour="mentee-list"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <p className="text-[12px] font-semibold text-gray-400 dark:text-slate-500">
                멘티 목록
              </p>
            </div>
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-hidden md:overflow-y-auto p-2 gap-1">
              {mentees.map((mentee) => (
                <MenteeListItem
                  key={mentee.userId}
                  userId={mentee.userId}
                  selected={mentee.userId === activeMenteeId}
                  onClick={() => setSelectedId(mentee.userId)}
                />
              ))}
            </div>
          </div>

          {/* 멘티 상세 */}
          <div
            className="flex-1 md:min-h-0 flex flex-col"
            data-tour="mentee-detail"
          >
            {activeMenteeId && (
              <MenteeDetail key={activeMenteeId} menteeId={activeMenteeId} />
            )}
            <SpotlightTour tourKey="mentee" steps={MENTEE_TOUR} />
          </div>
        </div>
      )}
    </div>
  );
}
