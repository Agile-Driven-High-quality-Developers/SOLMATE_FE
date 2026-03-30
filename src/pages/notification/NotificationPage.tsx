import { Bell, X } from "lucide-react";
import { useState } from "react";
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

  const [alertOpen, setAlertOpen] = useState(false);

  const { data: notifications = [] } = useNotificationsQuery();
  const { data: unreadCount } = useUnreadCountQuery();
  const acceptMentor = useAcceptMentorMutation();
  const rejectMentor = useRejectMentorMutation();
  const markRead = useMarkReadMutation();

  const handleAccept = (id: number) => {
    acceptMentor.mutate(id, {
      onError: () => {
        setAlertOpen(true);
        markRead.mutate(id);
      },
    });
  };

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const totalUnread = unreadCount?.total ?? 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950">
      {/* 이미 멘토 있음 알림 모달 */}
      {alertOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" onClick={() => setAlertOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">멘토 신청 수락 불가</p>
              <button onClick={() => setAlertOpen(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">이미 멘토가 있습니다.</p>
              <p className="text-[13px] text-gray-400 dark:text-slate-500">해당 멘티는 이미 다른 멘토가 배정되어 있어요.</p>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setAlertOpen(false)}
                className="w-full py-2.5 text-[14px] font-semibold text-white bg-[#0046FF] hover:bg-blue-700 rounded-xl transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
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
                onAccept={handleAccept}
                onReject={(id) => rejectMentor.mutate(id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
