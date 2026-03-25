import { useRef, useCallback, useState } from "react";
import { Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useUserListInfiniteQuery } from "@/api/userListApi";
import type { UserItem } from "@/api/userListApi";

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
  const cfg = PODIUM_CONFIG[rank];
  return (
    <div className="flex flex-col items-center">
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

function FollowButton({ user }: { user: UserItem }) {
  if (user.me) return null;
  return user.following ? (
    <Button variant="primary" width={64} className="text-[12px]">
      팔로잉
    </Button>
  ) : (
    <Button variant="basic" width={64} className="text-[12px]">
      팔로우
    </Button>
  );
}

function MentoringButton({
  user,
  hasAcceptedMentor,
}: {
  user: UserItem;
  hasAcceptedMentor: boolean;
}) {
  if (user.me) return null;

  if (user.mentoringStatus === "ACCEPTED") {
    return (
      <Button variant="primary" width={72} className="text-[12px] bg-orange-400 hover:bg-orange-500 border-none">
        멘토
      </Button>
    );
  }
  if (user.mentoringStatus === "PENDING") {
    return (
      <button
        disabled
        className="w-18 py-1.5 rounded-[10px] text-[12px] border border-orange-400 text-orange-400 bg-white cursor-default"
      >
        신청완료
      </button>
    );
  }
  return (
    <Button variant="basic" width={72} className="text-[12px]">
      <span className={hasAcceptedMentor ? "opacity-40" : ""}>멘토신청</span>
    </Button>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function UserRow({
  user,
  rank,
  hasAcceptedMentor,
}: {
  user: UserItem;
  rank: number;
  hasAcceptedMentor: boolean;
}) {
  return (
    <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${user.me ? "bg-blue-50/40" : ""}`}>
      {/* 순위 */}
      <td className="px-5 py-3.5 w-12">
        <span className={`text-[14px] font-bold ${rank <= 3 ? "text-[#0046FF]" : "text-gray-400"}`}>
          {rank}
        </span>
      </td>

      {/* 투자자 */}
      <td className="px-2 py-3.5">
        <div className="flex items-center gap-2.5">
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

      {/* 팔로우 */}
      <td className="px-3 py-3.5 text-right">
        <FollowButton user={user} />
      </td>

      {/* 멘토신청 */}
      <td className="px-5 py-3.5 text-right">
        <MentoringButton user={user} hasAcceptedMentor={hasAcceptedMentor} />
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserListPage() {
  const [tab, setTab] = useState<"전체" | "팔로잉">("전체");
  const [search, setSearch] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUserListInfiniteQuery();

  const allUsers = data?.pages.flatMap((p) => p.users) ?? [];
  const hasAcceptedMentor = data?.pages[0]?.hasAcceptedMentor ?? false;

  const filtered = allUsers
    .filter((u) => tab === "전체" || u.following)
    .filter((u) => !search || u.nickname.includes(search));

  // ─── Infinite Scroll Sentinel ─────────────────────────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const top3 = filtered.slice(0, 3);

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0046FF]">
            👥
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">유저 목록</h1>
            <p className="text-[12px] text-gray-400">수익률 기준 투자자 랭킹</p>
          </div>
        </div>
        {/* 검색 */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-52">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="투자자 검색..."
            className="text-[13px] text-gray-700 bg-transparent outline-none w-full placeholder:text-gray-400"
          />
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
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 포디움 */}
      {!isLoading && top3.length >= 3 && <Podium users={top3} />}

      {/* 랭킹 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[12px] text-gray-400 font-medium">순위</th>
              <th className="text-left px-2 py-3 text-[12px] text-gray-400 font-medium">투자자</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">팔로워</th>
              <th className="text-right px-3 py-3 text-[12px] text-gray-400 font-medium">팔로우</th>
              <th className="text-right px-5 py-3 text-[12px] text-gray-400 font-medium">멘토신청</th>
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
                    <td className="px-3 py-4"><div className="h-7 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                    <td className="px-5 py-4"><div className="h-7 bg-gray-100 rounded-lg w-18 ml-auto" /></td>
                  </tr>
                ))
              : filtered.map((user, i) => (
                  <UserRow
                    key={user.userId}
                    user={user}
                    rank={i + 1}
                    hasAcceptedMentor={hasAcceptedMentor}
                  />
                ))}
          </tbody>
        </table>

        {/* 무한 스크롤 센티넬 */}
        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#0046FF] border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
