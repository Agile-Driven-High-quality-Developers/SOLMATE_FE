import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "./authApi";
import type { MyDiariesItem } from "./tradeDiaryApi";
import type { TradeHistoryItem } from "./tradeApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MentorInfo = {
  userId: number;
  nickname: string;
  imageUrl: string;
  followerCount: number;
  followingCount: number;
  mentoringStatus: string;
  me: boolean;
  following: boolean;
};

export type MenteeItem = {
  userId: number;
  nickname: string;
  imageUrl: string;
  followerCount: number;
  totalReturnRate: number;
  totalReturnAmount: number;
};

export type MentorHoldingItem = {
  tickerCode: string;
  stockName: string;
  stockLogo: string;
  quantity: number;
  currentPrice: number;
  evaluation: number;
  returnRate: number;
  returnAmount: number;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const mentorQueryKeys = {
  mentor: ["mentor"] as const,
  mentees: ["mentees"] as const,
  holdings: (userId: number) => ["mentor", userId, "holdings"] as const,
  diaries: (userId: number) => ["mentor", userId, "diaries"] as const,
  history: (userId: number) => ["mentor", userId, "history"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export type MyMentorResponse = {
  hasMentor: boolean;
  userId: number;
};

export type MyMenteesResponse = {
  hasMentee: boolean;
  mentees: { userId: number }[];
};

export function useMyMentorQuery() {
  return useQuery({
    queryKey: mentorQueryKeys.mentor,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MyMentorResponse>>("/api/users/me/mentor")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useUserProfileQuery(userId: number) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MentorInfo>>(`/api/users/${userId}`)
        .then((res) => res.data),
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useMentorHoldingsQuery(userId: number) {
  return useQuery({
    queryKey: mentorQueryKeys.holdings(userId),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MentorHoldingItem[]>>(`/api/holdings/${userId}`)
        .then((res) => res.data),
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useMentorDiariesQuery(userId: number) {
  return useQuery({
    queryKey: mentorQueryKeys.diaries(userId),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MyDiariesItem[]>>(`/api/diaries/users/${userId}`)
        .then((res) => res.data),
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useMyMenteesQuery() {
  return useQuery({
    queryKey: mentorQueryKeys.mentees,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MyMenteesResponse>>("/api/users/me/mentees")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useMentorTradeHistoryQuery(userId: number) {
  return useQuery({
    queryKey: mentorQueryKeys.history(userId),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<TradeHistoryItem[]>>(`/api/trades/history/${userId}`)
        .then((res) => res.data),
    staleTime: 30_000,
    enabled: !!userId,
  });
}
