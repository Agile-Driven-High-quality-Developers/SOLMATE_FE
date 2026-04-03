import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, Loader2, X, GraduationCap, BookOpen } from "lucide-react";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const MENTOR_TOUR: TourStep[] = [
  {
    target: "mentor-card",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <GraduationCap size={15} />
        나의 멘토
      </span>
    ),
    description: "멘토의 투자 정보를 확인할 수 있어요.",
    items: ["포트폴리오와 매매일지, 매매내역도 함께 살펴볼 수 있어요"],
    placement: "bottom",
  },
  {
    target: "mentor-tabs",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <BookOpen size={15} />
        멘토의 투자 기록
      </span>
    ),
    description: "멘토가 어떻게 투자했는지 확인할 수 있어요.",
    items: [
      "포트폴리오 — 멘토가 보유한 종목 현황을 확인할 수 있어요.",
      "매매일지 — 멘토가 거래할 때 남긴 메모예요. 상세를 보고 댓글로 소통할 수 있어요.",
      "매매내역 — 멘토의 거래 기록을 볼 수 있어요.",
    ],
    placement: "bottom",
  },
];
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import UnderlineTabBar from "@/components/ui/UnderlineTabBar";
import MentorTradeDiaryTab from "@/components/profile/MentorTradeDiaryTab";
import TradeHistoryTab from "@/components/profile/TradeHistoryTab";
import PortfolioTab from "@/components/profile/PortfolioTab";
import {
  useMyMentorQuery,
  useUserProfileQuery,
  useMentorHoldingsQuery,
  useMentorDiariesQuery,
  useMentorTradeHistoryQuery,
} from "@/api/mentorApi";
import { useAccountSummaryByUserQuery } from "@/api/accountSummaryApi";
import { cancelMentoring } from "@/api/userListApi";
import { notificationQueryKeys } from "@/api/notificationApi";
import { useQueryClient } from "@tanstack/react-query";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

function CancelMentorModal({
  mentorNickname,
  onClose,
  onConfirm,
}: {
  mentorNickname: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-90 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">
            멘토 취소
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
            <span className="font-semibold text-[#0046FF]">
              {mentorNickname}
            </span>{" "}
            멘토를 취소하시겠어요?
          </p>
          <p className="text-[12px] text-gray-400 dark:text-slate-500">
            멘토 취소 후에도 다시 신청할 수 있어요.
          </p>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <Button variant="invalid" className="flex-1 py-2.5" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="danger"
            className="flex-1 py-2.5"
            onClick={onConfirm}
          >
            멘토 취소
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyMentorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: myMentor, isLoading: loadingMyMentor } = useMyMentorQuery();
  const mentorId = myMentor?.hasMentor ? (myMentor.userId ?? 0) : 0;
  const { data: mentor, isLoading: loadingMentor } =
    useUserProfileQuery(mentorId);
  const { data: summary } = useAccountSummaryByUserQuery(mentorId);
  const { data: holdingsRaw = [] } = useMentorHoldingsQuery(mentorId);
  const { data: diaries = [] } = useMentorDiariesQuery(mentorId);
  const { data: tradeHistories = [] } = useMentorTradeHistoryQuery(mentorId);

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

  if (loadingMyMentor || loadingMentor) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex flex-col p-4 sm:p-6 gap-5 min-h-screen bg-gray-50 dark:bg-slate-950">
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-[12px] font-medium px-5 py-3 rounded-2xl shadow-lg">
            {toast}
          </div>
        )}
        <h1 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100">
          나의 멘토
        </h1>
        <div className="flex-1 flex items-center justify-center text-[14px] text-gray-400 dark:text-slate-500">
          아직 멘토가 없습니다.
        </div>
      </div>
    );
  }

  const isPositive = (summary?.totalReturnRate ?? 0) >= 0;

  return (
    <div className="flex flex-col p-4 sm:p-6 gap-5 min-h-screen md:h-screen md:overflow-hidden bg-gray-50 dark:bg-slate-950">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-[12px] font-medium px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}
      {showCancelModal && (
        <CancelMentorModal
          mentorNickname={mentor.nickname}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async () => {
            try {
              await cancelMentoring(mentorId);
              await queryClient.invalidateQueries({ queryKey: ["mentor"] });
              queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.unreadCount,
              });
              showToast("멘토 취소가 완료되었습니다.");
            } catch {
              showToast("멘토 취소에 실패했습니다. 다시 시도해주세요.");
            } finally {
              setShowCancelModal(false);
            }
          }}
        />
      )}
      {/* 헤더 */}
      <div className="shrink-0">
        <h1 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100">
          나의 멘토
        </h1>
      </div>

      {/* 멘토 카드 */}
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-4 shrink-0"
        data-tour="mentor-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* 아바타 + 닉네임 + 통계 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar
              name={mentor.nickname}
              src={mentor.imageUrl || undefined}
              size={52}
            />
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">
                  {mentor.nickname}
                </span>
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                  멘토
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-gray-400" />
                  <span>팔로워</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">
                    {mentor.followerCount.toLocaleString()}명
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>총 수익률</span>
                  <span
                    className={`font-semibold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}
                  >
                    {isPositive ? "+" : ""}
                    {(summary?.totalReturnRate ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>총 수익</span>
                  <span
                    className={`font-semibold ml-0.5 ${isPositive ? "text-red-500" : "text-blue-500"}`}
                  >
                    {isPositive ? "+" : ""}
                    {fmtAmount(summary?.totalReturnAmount ?? 0)}
                  </span>
                </div>
                <div className=""></div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center gap-2 sm:shrink-0">
            <Button
              variant="basic"
              className="flex-1 sm:flex-none px-4 py-2 text-[12px]"
              onClick={() => navigate(`/users/${mentor.userId}`)}
            >
              프로필 보기
            </Button>
            <Button
              variant="danger"
              className="flex-1 sm:flex-none px-4 py-2 text-[12px] flex items-center justify-center gap-1.5"
              onClick={() => setShowCancelModal(true)}
            >
              <Users size={13} />
              멘토 취소
            </Button>
          </div>
        </div>
      </div>

      {/* 탭 + 콘텐츠 */}
      <div
        className="flex-1 md:min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col"
        data-tour="mentor-tabs"
      >
        <UnderlineTabBar
          tabs={[...TABS]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
        <div
          className={`p-5 flex-1 md:min-h-0 ${activeTab === "portfolio" ? "md:overflow-hidden overflow-y-auto" : "overflow-y-auto"}`}
        >
          {activeTab === "diary" && <MentorTradeDiaryTab items={diaries} />}
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
      <SpotlightTour tourKey="mentor" steps={MENTOR_TOUR} />
    </div>
  );
}
