import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";
import { stompSubscribe } from "@/lib/stompClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "FOLLOW"
  | "MENTORING_REQUEST"
  | "MENTORING_ACCEPTED"
  | "MENTORING_REJECTED"
  | "COMMENT"
  | "TRADE";

export type NotificationCategory = "SOCIAL" | "TRADING" | "MENTORING";

export type NotificationItem = {
  notificationId: number;
  notificationType: NotificationType;
  category: NotificationCategory;
  content: string;
  isRead: boolean;
  actUrl: string;
  createdAt: string;
  eventType?: "CREATE" | "DELETE";
};

export type NotificationCountResponse = {
  total: number;
  social: number;
  trading: number;
  mentoring: number;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const notificationQueryKeys = {
  list: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.list,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<NotificationItem[]>>("/api/notifications")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<NotificationCountResponse>>("/api/notifications/unread-count")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      fetchClient.patch(`/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });
}

export function useAcceptMentorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      fetchClient.post(`/api/notifications/${notificationId}/mentor-request/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });
}

export function useNotificationSubscription(userId: number | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const unsub = stompSubscribe(`/topic/notifications/${userId}`, (message) => {
      const item: NotificationItem = JSON.parse(message.body);

      if (item.eventType === "DELETE") {
        const prevList = queryClient.getQueryData<NotificationItem[]>(notificationQueryKeys.list);
        const deletedItem = prevList?.find((n) => n.notificationId === item.notificationId);

        queryClient.setQueryData<NotificationItem[]>(
          notificationQueryKeys.list,
          (prev) => prev ? prev.filter((n) => n.notificationId !== item.notificationId) : prev,
        );

        if (deletedItem && !deletedItem.isRead) {
          queryClient.setQueryData<NotificationCountResponse>(
            notificationQueryKeys.unreadCount,
            (prev) => {
              if (!prev) return prev;
              const categoryKey = deletedItem.category.toLowerCase() as keyof Omit<NotificationCountResponse, "total">;
              return {
                ...prev,
                total: Math.max(0, prev.total - 1),
                [categoryKey]: Math.max(0, prev[categoryKey] - 1),
              };
            },
          );
        } else {
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
        }
        return;
      }

      queryClient.setQueryData<NotificationItem[]>(
        notificationQueryKeys.list,
        (prev) => (prev ? [item, ...prev] : [item]),
      );

      queryClient.setQueryData<NotificationCountResponse>(
        notificationQueryKeys.unreadCount,
        (prev) => {
          if (!prev) return prev;
          const categoryKey = item.category.toLowerCase() as keyof Omit<NotificationCountResponse, "total">;
          return {
            ...prev,
            total: prev.total + 1,
            [categoryKey]: prev[categoryKey] + 1,
          };
        },
      );
    });

    return unsub;
  }, [userId, queryClient]);
}

export function useRejectMentorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      fetchClient.post(`/api/notifications/${notificationId}/mentor-request/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });
}
