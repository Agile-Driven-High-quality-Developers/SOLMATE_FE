import { Bell } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkReadMutation,
  useAcceptMentorMutation,
  useRejectMentorMutation,
} from "@/api/notificationApi";
import type { NotificationCategory } from "@/api/notificationApi";
import NotificationCard from "@/components/notification/NotificationCard";

type TabId = "all" | NotificationCategory;

const TABS: {
  id: TabId;
  label: string;
  countKey?: keyof {
    total: number;
    social: number;
    trading: number;
    mentoring: number;
  };
}[] = [
  { id: "all", label: "전체", countKey: "total" },
  { id: "MENTORING", label: "멘토신청", countKey: "mentoring" },
  { id: "TRADING", label: "주문체결", countKey: "trading" },
  { id: "SOCIAL", label: "팔로우", countKey: "social" },
];

export default function NotificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? "all") as TabId;
  const setActiveTab = (v: TabId) =>
    setSearchParams((p) => { if (v === "all") p.delete("tab"); else p.set("tab", v); return p; }, { replace: true });

  const { data: notifications = [] } = useNotificationsQuery();
  const { data: unreadCount } = useUnreadCountQuery();
  const acceptMentor = useAcceptMentorMutation();
  const rejectMentor = useRejectMentorMutation();
  const markRead = useMarkReadMutation();

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const totalUnread = unreadCount?.total ?? 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
      {/* 헤더 + 탭 (고정) */}
      <div className="flex flex-col gap-4 p-6 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-gray-100">
              알림
            </h1>
            {totalUnread > 0 && (
              <p className="text-[13px] text-gray-400 dark:text-slate-500">
                읽지 않은 알림 {totalUnread}개
              </p>
            )}
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.countKey ? (unreadCount?.[tab.countKey] ?? 0) : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-xl cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#0046FF] text-white"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`flex items-center justify-center rounded-full text-[11px] font-bold w-[18px] h-[18px] ${
                      isActive
                        ? "bg-white text-[#0046FF]"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 알림 리스트 (스크롤) */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-[14px] text-gray-400">
              알림이 없습니다.
            </div>
          ) : (
            filtered.map((item) => (
              <NotificationCard
                key={item.notificationId}
                item={item}
                onRead={(id) => markRead.mutate(id)}
                onAccept={(id) => acceptMentor.mutate(id)}
                onReject={(id) => rejectMentor.mutate(id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
