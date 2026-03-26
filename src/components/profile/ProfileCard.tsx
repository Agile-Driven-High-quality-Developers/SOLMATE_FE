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
  onEditClick: () => void;
  onLogoutClick: () => void;
  onDeleteClick: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
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
  onEditClick,
  onLogoutClick,
  onDeleteClick,
  onFollowersClick,
  onFollowingClick,
}: Props) {
  const isPositive = totalReturnRate >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* 아바타 + 닉네임 + 이메일 */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="mb-3">
          <Avatar name={nickname} src={profileImageUrl ?? undefined} size={80} />
        </div>
        <h2 className="text-[17px] font-bold text-gray-900">{nickname}</h2>
        {email && (
          <p className="text-[13px] text-gray-400 mt-0.5">{email}</p>
        )}
      </div>

      {/* 팔로워 / 팔로잉 */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={onFollowersClick}
          className="flex-1 text-center py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <p className="text-[15px] font-bold text-gray-900">{followers}</p>
          <p className="text-[12px] text-gray-400">팔로워</p>
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={onFollowingClick}
          className="flex-1 text-center py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <p className="text-[15px] font-bold text-gray-900">{following}</p>
          <p className="text-[12px] text-gray-400">팔로잉</p>
        </button>
      </div>

      {/* 수익률 / 총 수익 */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 mb-4">
        <div className="text-center">
          <p className="text-[12px] text-gray-400 mb-1">수익률</p>
          <p
            className={`text-[13px] font-bold ${
              isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
            }`}
          >
            {isPositive ? "+" : ""}
            {totalReturnRate.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[12px] text-gray-400 mb-1">총 수익</p>
          <p
            className={`text-[13px] font-bold ${
              isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
            }`}
          >
            {isPositive ? "+" : ""}
            {fmtAmount(totalReturn)}원
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <Button variant="invalid" className="w-full flex items-center justify-center gap-2" onClick={onEditClick}>
          <Settings size={14} />
          프로필 편집
        </Button>
        <Button variant="invalid" className="w-full flex items-center justify-center gap-2" onClick={onLogoutClick}>
          <LogOut size={14} />
          로그아웃
        </Button>
        <Button variant="invalid" className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50!" onClick={onDeleteClick}>
          <Trash2 size={14} />
          회원탈퇴
        </Button>
      </div>
    </div>
  );
}
