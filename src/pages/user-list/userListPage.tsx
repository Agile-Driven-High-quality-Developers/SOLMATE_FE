import { useNavigate, useSearchParams } from "react-router-dom";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const USERS_TOUR: TourStep[] = [
  {
    target: "users-follow",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <UserPlus size={15} />
        팔로우
      </span>
    ),
    description:
      "관심 있는 투자자를 팔로우하면 홈 화면 TOP 투자자에서 그 사람의 수익률을 바로 확인할 수 있어요.",
    placement: "left",
  },
  {
    target: "users-mentor",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <GraduationCap size={15} />
        멘토신청
      </span>
    ),
    description:
      "멘토로 등록하면 그 사람의 매매일지와 포트폴리오를 공유받을 수 있어요. 1명만 멘토로 설정할 수 있어요.",
    placement: "left",
  },
];
import { useState, useEffect, useRef } from "react";
import { Search, Medal, UserPlus, GraduationCap, Crown, X, ChevronsLeftRight } from "lucide-react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import {
  useUserListQuery,
  useUserListCacheUpdate,
  followUser,
  unfollowUser,
  requestMentoring,
  cancelMentoring,
  cancelPendingMentoring,
} from "@/api/userListApi";
import type { UserItem } from "@/api/userListApi";
import {
  fetchAccountSummary,
  fetchAccountSummaryByUser,
} from "@/api/accountSummaryApi";
import type { AccountSummaryData } from "@/api/accountSummaryApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortBy = "returnRate" | "returnAmount" | "follower";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "returnRate", label: "수익률순" },
  { value: "returnAmount", label: "수익순" },
  { value: "follower", label: "팔로워순" },
];

// ─── Utils ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#4ECDC4",
  "#45B7D1",
  "#FF6B35",
  "#96CEB4",
  "#DDA0DD",
  "#BB8FCE",
  "#85C1E9",
  "#F0A500",
  "#E74C3C",
  "#2ECC71",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}


function FollowButton({
  user,
  onToggle,
}: {
  user: UserItem;
  onToggle: (user: UserItem) => void;
}) {
  if (user.me) return null;
  return user.following ? (
    <Button
      variant="invalid"
      className="text-[12px] w-full"
      onClick={() => onToggle(user)}
    >
      팔로잉
    </Button>
  ) : (
    <Button
      variant="primary"
      className="text-[12px] w-full"
      onClick={() => onToggle(user)}
    >
      팔로우
    </Button>
  );
}

function MentoringButton({
  user,
  hasAcceptedMentor,
  onRequest,
  onCancel,
  onPendingCancel,
}: {
  user: UserItem;
  hasAcceptedMentor: boolean;
  onRequest: (user: UserItem) => void;
  onCancel: (user: UserItem) => void;
  onPendingCancel: (user: UserItem) => void;
}) {
  if (user.me) return null;

  // 멘토가 있는 상태에서 다른 사람은 버튼 숨김 (내 멘토만 표시)
  if (hasAcceptedMentor && user.mentoringStatus !== "ACCEPTED") return null;

  if (user.mentoringStatus === "ACCEPTED") {
    return (
      <button
        onClick={() => onCancel(user)}
        className="w-full py-1.5 rounded-[10px] text-[12px] text-white bg-orange-400 hover:bg-orange-500 transition-colors"
      >
        멘토취소
      </button>
    );
  }
  if (user.mentoringStatus === "PENDING") {
    return (
      <button
        onClick={() => onPendingCancel(user)}
        className="w-full py-1.5 rounded-[10px] text-[12px] border border-orange-400 text-orange-400 bg-white hover:bg-orange-50 transition-colors"
      >
        신청완료
      </button>
    );
  }
  return (
    <button
      disabled={hasAcceptedMentor}
      className={`w-full py-1.5 rounded-[10px] text-[12px] text-white bg-orange-400 hover:bg-orange-500 ${hasAcceptedMentor ? "opacity-40 cursor-default" : ""}`}
      onClick={() => !hasAcceptedMentor && onRequest(user)}
    >
      멘토신청
    </button>
  );
}

// ─── Return Rate / Amount Cells ───────────────────────────────────────────────

function ReturnCells({
  summary,
  isLoading,
}: {
  summary?: AccountSummaryData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <>
        <td className="px-4 py-3.5 text-right">
          <div className="h-3 bg-gray-100 rounded-full w-14 ml-auto animate-pulse" />
        </td>
        <td className="px-4 py-3.5 text-right">
          <div className="h-3 bg-gray-100 rounded-full w-16 ml-auto animate-pulse" />
        </td>
      </>
    );
  }

  const rate = summary?.totalReturnRate ?? 0;
  const amount = summary?.totalReturnAmount ?? 0;
  const isPositive = rate > 0;
  const isNegative = rate < 0;
  const color = isPositive
    ? "text-red-500"
    : isNegative
      ? "text-blue-500"
      : "text-gray-400";
  const prefix = isPositive ? "+" : "";

  return (
    <>
      <td
        className={`px-6 py-3.5 text-right font-semibold text-[14px] tabular-nums whitespace-nowrap ${color}`}
      >
        {prefix}
        {Math.abs(rate).toFixed(2)}%
      </td>
      <td
        className={`px-6 py-3.5 text-[14px] font-medium text-right whitespace-nowrap ${color}`}
      >
        {prefix}
        {(amount / 10000).toFixed(0)}만원
      </td>
    </>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function UserRow({
  user,
  rank,
  summary,
  summaryLoading,
  hasAcceptedMentor,
  onFollowToggle,
  onMentoringRequest,
  onMentoringCancel,
  onPendingCancel,
  isFirstNonMe,
}: {
  user: UserItem;
  rank: number;
  summary?: AccountSummaryData;
  summaryLoading: boolean;
  hasAcceptedMentor: boolean;
  onFollowToggle: (user: UserItem) => void;
  onMentoringRequest: (user: UserItem) => void;
  onMentoringCancel: (user: UserItem) => void;
  onPendingCancel: (user: UserItem) => void;
  isFirstNonMe?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <tr
      className={`border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors ${user.me ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
    >
      {/* 순위 */}
      <td className="px-6 py-3.5 text-center">
        {rank === 1 ? (
          <Crown size={20} className="mx-auto text-yellow-400" />
        ) : rank === 2 ? (
          <Medal size={20} className="mx-auto text-gray-400" />
        ) : rank === 3 ? (
          <Medal size={20} className="mx-auto text-amber-600" />
        ) : (
          <span className="text-[14px] font-bold text-gray-400">{rank}</span>
        )}
      </td>

      {/* 투자자 */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-70 transition-opacity w-fit"
          onClick={() =>
            navigate(user.me ? "/profile" : `/users/${user.userId}`)
          }
        >
          <Avatar
            name={user.nickname}
            src={user.imageUrl || undefined}
            size={32}
            color={getAvatarColor(user.nickname)}
          />
          <span className="text-[14px] font-medium text-gray-900 dark:text-gray-100">
            {user.nickname}
          </span>
          {user.me && (
            <span className="text-[11px] font-semibold text-white bg-[#0046FF] px-1.5 py-0.5 rounded-full">
              나
            </span>
          )}
        </div>
      </td>

      {/* 팔로워 */}
      <td className="px-6 py-3.5 text-[14px] text-gray-500 text-right whitespace-nowrap">
        {user.followerCount.toLocaleString()}명
      </td>

      {/* 총 수익률 / 총 수익 */}
      <ReturnCells summary={summary} isLoading={summaryLoading} />

      {/* 팔로우 */}
      <td
        className="hidden md:table-cell px-6 py-3.5 text-center"
        data-tour={isFirstNonMe ? "users-follow" : undefined}
      >
        <FollowButton user={user} onToggle={onFollowToggle} />
      </td>

      {/* 멘토 */}
      <td
        className="px-6 py-3.5 text-center hidden md:table-cell"
        data-tour={isFirstNonMe ? "users-mentor" : undefined}
      >
        <MentoringButton
          user={user}
          hasAcceptedMentor={hasAcceptedMentor}
          onRequest={onMentoringRequest}
          onCancel={onMentoringCancel}
          onPendingCancel={onPendingCancel}
        />
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") ?? "전체") as "전체" | "팔로잉";
  const sortBy = (searchParams.get("sort") ?? "returnRate") as SortBy;
  const [search, setSearch] = useState("");

  const setTab = (v: "전체" | "팔로잉") =>
    setSearchParams(
      (p) => {
        v === "전체" ? p.delete("tab") : p.set("tab", v);
        return p;
      },
      { replace: true },
    );
  const setSortBy = (v: SortBy) =>
    setSearchParams(
      (p) => {
        v === "returnRate" ? p.delete("sort") : p.set("sort", v);
        return p;
      },
      { replace: true },
    );

  const [showHint, setShowHint] = useState(true);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const isMobile = window.innerWidth < 500;
    if (!isMobile) return;
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [cancelTargetUser, setCancelTargetUser] = useState<UserItem | null>(
    null,
  );
  const [pendingCancelTargetUser, setPendingCancelTargetUser] =
    useState<UserItem | null>(null);

  const { data, isLoading } = useUserListQuery();
  const { toggleFollow, setMentoringStatus } = useUserListCacheUpdate();
  const queryClient = useQueryClient();

  const allUsers = data?.users ?? [];
  const hasAcceptedMentor = data?.hasAcceptedMentor ?? false;

  // 모든 유저의 수익 데이터를 병렬 프리페치 (정렬에 사용)
  const summaryQueries = useQueries({
    queries: allUsers.map((u) => ({
      queryKey: u.me ? ["account-summary"] : ["account-summary", u.userId],
      queryFn: u.me
        ? fetchAccountSummary
        : () => fetchAccountSummaryByUser(u.userId),
      staleTime: u.me ? 10_000 : 60_000,
      refetchInterval: u.me ? 10_000 : 60_000,
    })),
  });

  const summaryMap = new Map<
    number,
    { data?: AccountSummaryData; isLoading: boolean }
  >();
  allUsers.forEach((u, i) => {
    summaryMap.set(u.userId, {
      data: summaryQueries[i]?.data,
      isLoading: summaryQueries[i]?.isLoading ?? false,
    });
  });

  async function handleFollowToggle(user: UserItem) {
    toggleFollow(user.userId, !user.following);
    try {
      if (user.following) {
        await unfollowUser(user.userId);
      } else {
        await followUser(user.userId);
      }
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({
        queryKey: ["follows", user.userId, "followers"],
      });
      queryClient.invalidateQueries({ queryKey: ["follows", "following"] });
    } catch {
      toggleFollow(user.userId, user.following);
    }
  }

  async function handleMentoringRequest(user: UserItem) {
    setMentoringStatus(user.userId, "PENDING", hasAcceptedMentor);
    try {
      await requestMentoring(user.userId);
    } catch {
      setMentoringStatus(user.userId, "NONE", hasAcceptedMentor);
    }
  }

  async function handleMentoringCancel(user: UserItem) {
    setCancelTargetUser(user);
  }

  async function confirmMentoringCancel() {
    if (!cancelTargetUser) return;
    const user = cancelTargetUser;
    setCancelTargetUser(null);
    setMentoringStatus(user.userId, "NONE", false);
    try {
      await cancelMentoring(user.userId);
    } catch {
      setMentoringStatus(user.userId, "ACCEPTED", true);
    }
  }

  async function handlePendingMentoringCancel(user: UserItem) {
    setPendingCancelTargetUser(user);
  }

  async function confirmPendingCancel() {
    if (!pendingCancelTargetUser) return;
    const user = pendingCancelTargetUser;
    setPendingCancelTargetUser(null);
    setMentoringStatus(user.userId, "NONE", hasAcceptedMentor);
    try {
      await cancelPendingMentoring(user.userId);
    } catch {
      setMentoringStatus(user.userId, "PENDING", hasAcceptedMentor);
    }
  }

  const filtered = allUsers
    .filter((u) => tab === "전체" || u.following || u.me)
    .filter((u) => !search || u.nickname.includes(search));

  const allSummariesLoaded =
    sortBy === "follower" || summaryQueries.every((q) => !q.isLoading);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "follower") return b.followerCount - a.followerCount;
    if (!allSummariesLoaded) return 0;
    const aData = summaryMap.get(a.userId)?.data;
    const bData = summaryMap.get(b.userId)?.data;
    if (sortBy === "returnRate") {
      return (
        (bData?.totalReturnRate ?? -Infinity) -
        (aData?.totalReturnRate ?? -Infinity)
      );
    }
    return (
      (bData?.totalReturnAmount ?? -Infinity) -
      (aData?.totalReturnAmount ?? -Infinity)
    );
  });

  return (
    <div className="flex flex-col h-screen p-6 gap-4 overflow-hidden bg-gray-50 dark:bg-slate-950">
      {cancelTargetUser && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
          onClick={() => setCancelTargetUser(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-[360px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
                멘토 취소
              </p>
              <button
                onClick={() => setCancelTargetUser(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
                <span className="font-bold text-[#0046FF]">
                  {cancelTargetUser.nickname}
                </span>{" "}
                멘토를 취소하시겠어요?
              </p>
              <p className="text-[13px] text-gray-400 dark:text-slate-500">
                멘토 취소 후에도 다시 신청할 수 있어요.
              </p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <Button
                variant="invalid"
                className="flex-1 py-2.5"
                onClick={() => setCancelTargetUser(null)}
              >
                닫기
              </Button>
              <Button
                variant="danger"
                className="flex-1 py-2.5"
                onClick={confirmMentoringCancel}
              >
                멘토 취소
              </Button>
            </div>
          </div>
        </div>
      )}
      {pendingCancelTargetUser && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
          onClick={() => setPendingCancelTargetUser(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-[360px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
                신청 취소
              </p>
              <button
                onClick={() => setPendingCancelTargetUser(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
                <span className="font-bold text-[#0046FF]">
                  {pendingCancelTargetUser.nickname}
                </span>{" "}
                멘토 신청을 취소하시겠어요?
              </p>
              <p className="text-[13px] text-gray-400 dark:text-slate-500">
                취소 후에도 다시 신청할 수 있어요.
              </p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <Button
                variant="invalid"
                className="flex-1 py-2.5"
                onClick={() => setPendingCancelTargetUser(null)}
              >
                닫기
              </Button>
              <Button
                variant="danger"
                className="flex-1 py-2.5"
                onClick={confirmPendingCancel}
              >
                신청 취소
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">
            유저 목록
          </h1>
          <p className="text-[12px] text-gray-400 dark:text-slate-500">
            투자자 랭킹
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2">
        {(["전체", "팔로잉"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-5 py-2 rounded-lg text-[14px] font-semibold transition-colors",
              tab === t
                ? "bg-[#0046FF] text-white"
                : "bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      <SpotlightTour tourKey="users" steps={USERS_TOUR} />

      {/* 랭킹 테이블 */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden min-h-0">
        {/* 검색 + 정렬 */}
        <div className="flex flex-col min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 min-[500px]:w-52">
            <Search
              size={14}
              className="text-gray-400 dark:text-slate-500 shrink-0"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="투자자 검색"
              className="text-[13px] text-gray-700 dark:text-gray-300 bg-transparent outline-none w-full placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={[
                  "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap",
                  sortBy === opt.value
                    ? "bg-[#0046FF]/10 text-[#0046FF] border border-[#0046FF]/30"
                    : "bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div
          className="overflow-y-auto overflow-x-auto flex-1 relative"
          ref={tableScrollRef}
          onScroll={() => setShowHint(false)}
          onClick={() => setShowHint(false)}
        >
          {showHint && (
            <div className="min-[500px]:hidden absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/10 dark:bg-slate-900/10 backdrop-blur-[2px] rounded-xl cursor-pointer">
              <ChevronsLeftRight
                size={22}
                className="text-gray-400 dark:text-slate-400"
              />
              <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400">
                좌우로 스크롤 해보세요
              </p>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="text-center px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap w-20">
                  순위
                </th>
                <th className="text-left px-4 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                  투자자
                </th>
                <th className="text-right px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap w-24">
                  팔로워
                </th>
                <th className="text-right px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap w-28">
                  총 수익률
                </th>
                <th className="text-right px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap w-32">
                  총 수익
                </th>
                <th className="hidden md:table-cell text-center px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap w-28">
                  팔로우
                </th>
                <th className="hidden md:table-cell text-center px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap w-28">
                  멘토
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading || !allSummariesLoaded
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 animate-pulse"
                    >
                      <td className="px-5 py-4">
                        <div className="h-3 bg-gray-100 rounded-full w-4" />
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gray-100 rounded-full" />
                          <div className="h-3 bg-gray-100 rounded-full w-24" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 bg-gray-100 rounded-full w-10 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 bg-gray-100 rounded-full w-14 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3 bg-gray-100 rounded-full w-16 ml-auto" />
                      </td>
                      <td className="hidden md:table-cell px-3 py-4">
                        <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded-lg w-16 ml-auto" />
                      </td>
                      <td className="hidden md:table-cell px-5 py-4">
                        <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded-lg w-18 ml-auto" />
                      </td>
                    </tr>
                  ))
                : (() => {
                    const firstNonMeIdx = sorted.findIndex((u) => !u.me);
                    return sorted.map((user, i) => {
                      const s = summaryMap.get(user.userId);
                      return (
                        <UserRow
                          key={user.userId}
                          user={user}
                          rank={i + 1}
                          summary={s?.data}
                          summaryLoading={s?.isLoading ?? false}
                          hasAcceptedMentor={hasAcceptedMentor}
                          onFollowToggle={handleFollowToggle}
                          onMentoringRequest={handleMentoringRequest}
                          onMentoringCancel={handleMentoringCancel}
                          onPendingCancel={handlePendingMentoringCancel}
                          isFirstNonMe={i === firstNonMeIdx}
                        />
                      );
                    });
                  })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
