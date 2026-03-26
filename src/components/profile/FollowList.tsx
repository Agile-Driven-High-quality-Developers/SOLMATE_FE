import Avatar from "@/components/ui/Avatar";
import type { FollowUser } from "@/api/userListApi";

type Props = {
  type: "followers" | "following";
  items: FollowUser[];
};

const LABEL = { followers: "팔로워", following: "팔로잉" };

export default function FollowList({ type, items }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 mt-3 flex-1 overflow-y-auto">
      <p className="text-[13px] font-semibold text-gray-700 px-4 pt-4 pb-2">{LABEL[type]}</p>
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10">
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
        </div>
      )}
    </div>
  );
}
