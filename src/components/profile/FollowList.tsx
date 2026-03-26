import { useEffect, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import {
  useFollowersInfiniteQuery,
  useFollowingInfiniteQuery,
} from "@/api/userListApi";

type Props = {
  type: "followers" | "following";
};

const LABEL = { followers: "팔로워", following: "팔로잉" };

export default function FollowList({ type }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const followersQuery = useFollowersInfiniteQuery();
  const followingQuery = useFollowingInfiniteQuery();
  const query = type === "followers" ? followersQuery : followingQuery;

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
    <div className="bg-white rounded-2xl border border-gray-100 mt-3 flex-1 overflow-y-auto">
      <p className="text-[13px] font-semibold text-gray-700 px-4 pt-4 pb-2">{LABEL[type]}</p>
      {items.length === 0 && !query.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-[12px] text-gray-400">{LABEL[type]}이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col pb-2">
          {items.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <Avatar name={user.nickname} src={user.imageUrl} size={32} />
              <span className="text-[13px] font-medium text-gray-800">{user.nickname}</span>
            </div>
          ))}
          <div ref={bottomRef} className="h-1" />
        </div>
      )}
    </div>
  );
}
