import { Settings, LogOut, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

type Props = {
  nickname: string;
  email?: string;
  profileImageUrl?: string | null;

  followers: number;
  following: number;
  totalReturnRate: number;
  totalReturn: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;

  // 내 프로필
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  onLogoutClick?: () => void;
  onDeleteClick?: () => void;

  // 타인 프로필
  isFollowing?: boolean;
  onFollowClick?: () => void;
  badge?: "멘토" | "멘티";
  mentoringStatus?: "NONE" | "PENDING" | "ACCEPTED";
  hasAcceptedMentor?: boolean;
  onMentoringRequest?: () => void;
  onMentoringCancel?: () => void;
};

function fmtAmount(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString("ko-KR");
}

export default function ProfileCard({
  nickname,
  email,
  profileImageUrl,
  followers,
  following,
  totalReturnRate,
  totalReturn,
  onFollowersClick,
  onFollowingClick,
  isOwnProfile = true,
  onEditClick,
  onLogoutClick,
  onDeleteClick,
  isFollowing,
  onFollowClick,
  badge,
  mentoringStatus,
  hasAcceptedMentor,
  onMentoringRequest,
  onMentoringCancel,
}: Props) {
  const isPositive = totalReturnRate >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
      {/* 아바타 + 닉네임 + 이메일 */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="mb-3">
          <Avatar
            name={nickname}
            src={profileImageUrl ?? undefined}
            size={80}
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
            {nickname}
          </h2>
          {badge === "멘토" && (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              멘토
            </span>
          )}
          {badge === "멘티" && (
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              멘티
            </span>
          )}
        </div>
        {email && (
          <p className="text-[13px] text-gray-400 dark:text-slate-500 mt-0.5">
            {email}
          </p>
        )}
      </div>

      {/* 팔로워 / 팔로잉 */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={onFollowersClick}
          className="flex-1 text-center py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
            {followers}
          </p>
          <p className="text-[12px] text-gray-400 dark:text-slate-500">
            팔로워
          </p>
        </button>
        <div className="w-px bg-gray-100 dark:bg-slate-800" />
        <button
          onClick={onFollowingClick}
          className="flex-1 text-center py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
            {following}
          </p>
          <p className="text-[12px] text-gray-400 dark:text-slate-500">
            팔로잉
          </p>
        </button>
      </div>

      {/* 수익률 / 총 수익 */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-slate-800 mb-4">
        <div className="text-center">
          <p className="text-[12px] text-gray-400 dark:text-slate-500 mb-1">
            총 수익률
          </p>
          <p
            className={`text-[13px] font-bold ${isPositive ? "text-[#FF4444]" : "text-[#0046FF]"}`}
          >
            {isPositive ? "+" : ""}
            {totalReturnRate.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[12px] text-gray-400 dark:text-slate-500 mb-1">
            총 수익
          </p>
          <p
            className={`text-[13px] font-bold ${isPositive ? "text-[#FF4444]" : "text-[#0046FF]"}`}
          >
            {isPositive ? "+" : ""}
            {fmtAmount(totalReturn)}원
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-slate-800">
        {isOwnProfile ? (
          <>
            <Button
              variant="invalid"
              className="w-full flex items-center justify-center gap-2"
              onClick={onEditClick}
            >
              <Settings size={14} />
              프로필 편집
            </Button>
            {/* <Button variant="invalid" className="w-full flex items-center justify-center gap-2" onClick={onLogoutClick}>
              <LogOut size={14} />
              로그아웃
            </Button> */}
          </>
        ) : (
          <>
            <Button
              variant={isFollowing ? "basic" : "primary"}
              className="w-full"
              onClick={onFollowClick}
            >
              {isFollowing ? "팔로잉" : "팔로우"}
            </Button>
            {mentoringStatus === "ACCEPTED" && (
              <button
                onClick={onMentoringCancel}
                className="w-full py-1.5 rounded-[10px] text-white bg-orange-400 hover:bg-orange-500 transition-colors"
              >
                멘토취소
              </button>
            )}
            {mentoringStatus === "PENDING" && (
              <button
                disabled
                className="w-full py-1.5 rounded-[10px] border border-orange-400 text-orange-400 bg-white dark:bg-slate-900 opacity-60 cursor-default"
              >
                신청완료
              </button>
            )}
            {mentoringStatus === "NONE" && (
              <button
                disabled={hasAcceptedMentor}
                onClick={onMentoringRequest}
                className={`w-full py-1.5 rounded-[10px] text-white bg-orange-400 transition-colors ${hasAcceptedMentor ? "opacity-40 cursor-default" : "hover:bg-orange-500"}`}
              >
                멘토신청
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
