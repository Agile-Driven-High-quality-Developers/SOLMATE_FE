import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";

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
