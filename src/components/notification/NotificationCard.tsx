import { Bell, Users, Zap, CheckCircle, XCircle } from "lucide-react";
import type { NotificationItem } from "@/api/notificationApi";

type Props = {
  item: NotificationItem;
  onRead?: (id: number) => void;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
};

function timeAgo(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
}

type IconConfig = {
  bg: string;
  icon: React.ReactNode;
  badgeText: string;
  badgeClass: string;
};

function getIconConfig(type: NotificationItem["notificationType"]): IconConfig {
  switch (type) {
    case "MENTORING_REQUEST":
      return {
        bg: "bg-yellow-100",
        icon: <Bell size={18} className="text-yellow-500" />,
        badgeText: "멘토 신청",
        badgeClass: "text-yellow-600 bg-yellow-50",
      };
    case "MENTORING_ACCEPTED":
      return {
        bg: "bg-green-50",
        icon: <CheckCircle size={18} className="text-green-500" />,
        badgeText: "멘토 수락",
        badgeClass: "text-green-600 bg-green-50",
      };
    case "MENTORING_REJECTED":
      return {
        bg: "bg-red-50",
        icon: <XCircle size={18} className="text-red-400" />,
        badgeText: "멘토 거절",
        badgeClass: "text-red-500 bg-red-50",
      };
    case "TRADE":
      return {
        bg: "bg-orange-50",
        icon: <Zap size={18} className="text-orange-500" />,
        badgeText: "주문 체결",
        badgeClass: "text-orange-600 bg-orange-50",
      };
    case "FOLLOW":
    case "COMMENT":
    default:
      return {
        bg: "bg-blue-50",
        icon: <Users size={18} className="text-[#0046FF]" />,
        badgeText: type === "FOLLOW" ? "팔로우 거래 알림" : "알림",
        badgeClass: "text-blue-600 bg-blue-50",
      };
  }
}

export default function NotificationCard({ item, onRead, onAccept, onReject }: Props) {
  const { bg, icon, badgeText, badgeClass } = getIconConfig(item.notificationType);
  const isUnread = !item.isRead;

  const handleClick = () => {
    if (isUnread) onRead?.(item.notificationId);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl border p-5 shadow-sm cursor-pointer ${
        isUnread ? "bg-white border-blue-200" : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${
            !isUnread ? "opacity-60" : ""
          }`}
        >
          {icon}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          {/* 뱃지 + 읽음 점 + 시간 */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-md ${isUnread ? badgeClass : "text-gray-400 bg-gray-100"}`}>
                {badgeText}
              </span>
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-[#0046FF] inline-block" />
              )}
            </div>
            <span className="text-[12px] text-gray-400 shrink-0">{timeAgo(item.createdAt)}</span>
          </div>

          {/* 메시지 */}
          <p className={`text-[14px] font-medium mt-1.5 ${isUnread ? "text-gray-800" : "text-gray-500"}`}>
            {item.content}
          </p>

          {/* 멘토 신청 액션 버튼 */}
          {item.notificationType === "MENTORING_REQUEST" && isUnread && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => onAccept?.(item.notificationId)}
                className="px-3 py-1.5 text-[12px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg cursor-pointer transition-colors"
              >
                수락
              </button>
              <button
                onClick={() => onReject?.(item.notificationId)}
                className="px-3 py-1.5 text-[12px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer transition-colors"
              >
                거절
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
