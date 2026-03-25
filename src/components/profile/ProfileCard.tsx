import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Pencil, LogOut, Trash2 } from "lucide-react";

type Props = {
  nickname: string;
  email: string;
  followerCount: number;
  followingCount: number;
  returnRate: number;
  returnAmount: number;
  onEditProfile?: () => void;
  onLogout?: () => void;
  onWithdraw?: () => void;
};

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function ProfileCard({
  nickname,
  email,
  followerCount,
  followingCount,
  returnRate,
  returnAmount,
  onEditProfile,
  onLogout,
  onWithdraw,
}: Props) {
  const isPositive = returnRate >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2">
        <Avatar name={nickname} size={80} />
        <div className="text-center">
          <p className="text-[17px] font-bold text-gray-900">{nickname}</p>
          <p className="text-[13px] text-gray-400 mt-0.5">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 w-full border-y border-gray-100 py-3">
        <div className="flex flex-col items-center gap-0.5 border-r border-gray-100">
          <p className="text-[16px] font-bold text-gray-900">{followerCount}</p>
          <p className="text-[12px] text-gray-400">팔로워</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[16px] font-bold text-gray-900">{followingCount}</p>
          <p className="text-[12px] text-gray-400">팔로잉</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 border-r border-gray-100 pt-3">
          <p className={`text-[16px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{returnRate.toFixed(2)}%
          </p>
          <p className="text-[12px] text-gray-400">수익률</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 pt-3">
          <p className={`text-[16px] font-bold ${isPositive ? "text-red-500" : "text-blue-500"}`}>
            {isPositive ? "+" : ""}{fmt(returnAmount)}
          </p>
          <p className="text-[12px] text-gray-400">총 수익</p>
        </div>

      </div>

      <div className="flex flex-col w-full gap-2">
        <Button variant="invalid" className="w-full flex items-center justify-center gap-1.5" onClick={onEditProfile}>
          <Pencil size={14} />프로필 편집
        </Button>
        <Button variant="invalid" className="w-full flex items-center justify-center gap-1.5" onClick={onLogout}>
          <LogOut size={14} />로그아웃
        </Button>
        <Button variant="danger" className="w-full flex items-center justify-center gap-1.5" onClick={onWithdraw}>
          <Trash2 size={14} />회원탈퇴
        </Button>
      </div>
    </div>
  );
}
