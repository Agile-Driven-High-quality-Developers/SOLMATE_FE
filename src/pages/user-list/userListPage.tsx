import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
  { value: "returnRate",   label: "수익률순"  },
  { value: "returnAmount", label: "수익순"    },
  { value: "follower",     label: "팔로워수순" },
];

// ─── Utils ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#4ECDC4", "#45B7D1", "#FF6B35", "#96CEB4", "#DDA0DD",
  "#BB8FCE", "#85C1E9", "#F0A500", "#E74C3C", "#2ECC71",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Podium ───────────────────────────────────────────────────────────────────

const PODIUM_CONFIG = {
  1: { barHeight: "h-24", barBg: "bg-yellow-400" },
  2: { barHeight: "h-16", barBg: "bg-gray-400"   },
  3: { barHeight: "h-12", barBg: "bg-orange-400" },
} as const;

function PodiumSlot({ user, rank }: { user: UserItem; rank: 1 | 2 | 3 }) {
  const navigate = useNavigate();
  const cfg = PODIUM_CONFIG[rank];
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate(user.me ? "/profile" : `/users/${user.userId}`)}>
      {rank === 1 && <span className="text-xl mb-1">👑</span>}
      <Avatar
        name={user.nickname}
        src={user.imageUrl || undefined}
        size={rank === 1 ? 56 : 44}
        color={getAvatarColor(user.nickname)}
      />
      <p className="text-[13px] font-medium text-gray-800 mt-1.5 max-w-20 text-center truncate">
        {user.nickname}
      </p>
      <div
        className={`w-20 rounded-t-xl mt-2 flex items-center justify-center ${cfg.barHeight} ${cfg.barBg}`}
      >
        <span className="text-white text-[20px] font-bold">{rank}</span>
      </div>
    </div>
  );
}

function Podium({ users }: { users: UserItem[] }) {
  const [second, first, third] = [users[1], users[0], users[2]];
  return (
    <div className="flex items-end justify-center gap-3 py-6 bg-gray-50 rounded-2xl mb-4">
      {second && <PodiumSlot user={second} rank={2} />}
      {first  && <PodiumSlot user={first}  rank={1} />}
      {third  && <PodiumSlot user={third}  rank={3} />}
    </div>
  );
}

// ─── Follow / Mentoring Buttons ───────────────────────────────────────────────

function FollowButton({
  user,
  onToggle,
}: {
  user: UserItem;
  onToggle: (user: UserItem) => void;
}) {
  if (user.me) return null;
  return user.following ? (
    <Button variant="basic" className="text-[12px] w-full" onClick={() => onToggle(user)}>
      팔로잉
    </Button>
  ) : (
    <Button variant="primary" className="text-[12px] w-full" onClick={() => onToggle(user)}>
      팔로우
    </Button>
  );
}

function MentoringButton({
  user,
  hasAcceptedMentor,
  onRequest,
  onCancel,
}: {
  user: UserItem;
  hasAcceptedMentor: boolean;
  onRequest: (user: UserItem) => void;
  onCancel: (user: UserItem) => void;
}) {
  if (user.me) return null;

  // 멘토가 있는 상태에서 다른 사람은 버튼 숨김 (내 멘토만 표시)
  if (hasAcceptedMentor && user.mentoringStatus !== "ACCEPTED") return null;

  if (user.mentoringStatus === "ACCEPTED") {
    return (
      <button
        disabled
        className="w-full py-1.5 rounded-[10px] text-[12px] text-white bg-orange-400 cursor-default"
      >
        멘토
      </button>
    );
  }
  if (user.mentoringStatus === "PENDING") {
    return (
      <button
        disabled
        className="w-full py-1.5 rounded-[10px] text-[12px] border border-orange-400 text-orange-400 bg-white cursor-default opacity-60"
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
  const color = isPositive ? "text-red-500" : isNegative ? "text-blue-500" : "text-gray-400";
  const prefix = isPositive ? "+" : "";

  return (
    <>
      <td className={`px-4 py-3.5 text-[13px] font-medium text-right ${color}`}>
        {prefix}{rate.toFixed(1)}%
      </td>
      <td className={`px-4 py-3.5 text-[13px] font-medium text-right ${color}`}>
        {prefix}{(amount / 10000).toFixed(0)}만원
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
}: {
  user: UserItem;
  rank: number;
  summary?: AccountSummaryData;
  summaryLoading: boolean;
  hasAcceptedMentor: boolean;
  onFollowToggle: (user: UserItem) => void;
  onMentoringRequest: (user: UserItem) => void;
  onMentoringCancel: (user: UserItem) => void;
}) {
  const navigate = useNavigate();
  return (
    <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${user.me ? "bg-blue-50/40" : ""}`}>
      {/* 순위 */}
      <td className="px-5 py-3.5 text-center">
        <span className={`text-[14px] font-bold ${rank <= 3 ? "text-[#0046FF]" : "text-gray-400"}`}>
          {rank}
        </span>
      </td>

      {/* 투자자 */}
      <td className="px-2 py-3.5">
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-70 transition-opacity w-fit" onClick={() => navigate(user.me ? "/profile" : `/users/${user.userId}`)}>
          <Avatar
            name={user.nickname}
            src={user.imageUrl || undefined}
            size={32}
            color={getAvatarColor(user.nickname)}
          />
          <span className="text-[14px] font-medium text-gray-900">{user.nickname}</span>
          {user.me && (
            <span className="text-[11px] font-semibold text-white bg-[#0046FF] px-1.5 py-0.5 rounded-full">
              나
            </span>
          )}
        </div>
      </td>

      {/* 팔로워 */}
      <td className="px-4 py-3.5 text-[13px] text-gray-500 text-right">
        {user.followerCount.toLocaleString()}명
      </td>

      {/* 총 수익률 / 총 수익 */}
      <ReturnCells summary={summary} isLoading={summaryLoading} />

      {/* 팔로우 */}
      <td className="px-4 py-3.5 text-center">
        <FollowButton user={user} onToggle={onFollowToggle} />
      </td>

      {/* 멘토 */}
      <td className="px-4 py-3.5 text-center">
        <MentoringButton
          user={user}
          hasAcceptedMentor={hasAcceptedMentor}
          onRequest={onMentoringRequest}
          onCancel={onMentoringCancel}
        />
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserListPage() {
  const [tab, setTab] = useState<"전체" | "팔로잉">("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("returnRate");

  const { data, isLoading } = useUserListQuery();
  const { toggleFollow, setMentoringStatus } = useUserListCacheUpdate();
  const queryClient = useQueryClient();

  const allUsers = data?.users ?? [];
  const hasAcceptedMentor = data?.hasAcceptedMentor ?? false;

  // 모든 유저의 수익 데이터를 병렬 프리페치 (정렬에 사용)
  const summaryQueries = useQueries({
    queries: allUsers.map((u) => ({
      queryKey: u.me ? ["account-summary"] : ["account-summary", u.userId],
      queryFn: u.me ? fetchAccountSummary : () => fetchAccountSummaryByUser(u.userId),
      refetchInterval: u.me ? 10_000 : 60_000,
    })),
  });

  const summaryMap = new Map<number, { data?: AccountSummaryData; isLoading: boolean }>();
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
      queryClient.invalidateQueries({ queryKey: ["follows", user.userId, "followers"] });
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
    setMentoringStatus(user.userId, "NONE", false);
    try {
      await cancelMentoring(user.userId);
    } catch {
      setMentoringStatus(user.userId, "ACCEPTED", true);
    }
  }

  const filtered = allUsers
    .filter((u) => tab === "전체" || u.following || u.me)
    .filter((u) => !search || u.nickname.includes(search));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "follower") return b.followerCount - a.followerCount;
    const aData = summaryMap.get(a.userId)?.data;
    const bData = summaryMap.get(b.userId)?.data;
    if (sortBy === "returnRate") {
      return (bData?.totalReturnRate ?? -Infinity) - (aData?.totalReturnRate ?? -Infinity);
    }
    return (bData?.totalReturnAmount ?? -Infinity) - (aData?.totalReturnAmount ?? -Infinity);
  });

  const top3 = sorted.slice(0, 3);

  return (
    <div className="flex flex-col h-screen p-6 gap-4 overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0046FF]">
          👥
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">유저 목록</h1>
          <p className="text-[12px] text-gray-400">투자자 랭킹</p>
        </div>
      </div>

      {/* 포디움 */}
      {!isLoading && top3.length >= 3 && <Podium users={top3} />}

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
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 랭킹 테이블 */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-0">
        {/* 검색 + 정렬 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="투자자 검색..."
              className="text-[13px] text-gray-700 bg-transparent outline-none w-full placeholder:text-gray-400"
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
                    : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
              <th className="text-center px-5 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap w-16">순위</th>
              <th className="text-left px-2 py-3 text-[12px] text-gray-400 font-medium">투자자</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap w-20">팔로워</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap w-24">총 수익률</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap w-28">총 수익</th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap w-24">팔로우</th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap w-24">멘토</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded-full w-4" /></td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gray-100 rounded-full" />
                        <div className="h-3 bg-gray-100 rounded-full w-24" />
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded-full w-10 ml-auto" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded-full w-14 ml-auto" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded-full w-16 ml-auto" /></td>
                    <td className="px-3 py-4"><div className="h-7 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                    <td className="px-5 py-4"><div className="h-7 bg-gray-100 rounded-lg w-18 ml-auto" /></td>
                  </tr>
                ))
              : sorted.map((user, i) => {
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
                    />
                  );
                })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
