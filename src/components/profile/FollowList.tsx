import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import {
  useMyProfileQuery,
  useFollowersInfiniteQuery,
  useFollowingInfiniteQuery,
  useUserFollowersInfiniteQuery,
  useUserFollowingInfiniteQuery,
} from "@/api/userListApi";

type Props = {
  type: "followers" | "following";
  userId?: number;
};

const LABEL = { followers: "팔로워", following: "팔로잉" };
const EMPTY_LABEL = { followers: "팔로워가 없습니다.", following: "팔로잉이 없습니다." };

export default function FollowList({ type, userId }: Props) {
  const navigate = useNavigate();
  const { data: me } = useMyProfileQuery();
  const bottomRef = useRef<HTMLDivElement>(null);

  const myFollowersQuery = useFollowersInfiniteQuery();
  const myFollowingQuery = useFollowingInfiniteQuery();
  const userFollowersQuery = useUserFollowersInfiniteQuery(userId ?? 0);
  const userFollowingQuery = useUserFollowingInfiniteQuery(userId ?? 0);

  const query = userId
    ? type === "followers" ? userFollowersQuery : userFollowingQuery
    : type === "followers" ? myFollowersQuery : myFollowingQuery;

  const items = query.data?.pages.flatMap((p) => p.users) ?? [];

  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [query]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mt-3 flex-1 overflow-y-auto">
      <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 px-4 pt-4 pb-2">{LABEL[type]}</p>
      {items.length === 0 && !query.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-[12px] text-gray-400 dark:text-slate-500">{EMPTY_LABEL[type]}</p>
        </div>
      ) : (
        <div className="flex flex-col pb-2">
          {items.map((user) => (
            <div
              key={user.userId}
              onClick={() => user.userId === me?.userId ? navigate("/profile") : navigate(`/users/${user.userId}`)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Avatar name={user.nickname} src={user.imageUrl} size={32} />
              <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">{user.nickname}</span>
            </div>
          ))}
          <div ref={bottomRef} className="h-1" />
        </div>
      )}
    </div>
  );
}
