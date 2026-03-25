import { fetchClient } from "@/lib/fetchClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ApiResponse } from "./authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MentoringStatus = "NONE" | "PENDING" | "ACCEPTED";

export type UserItem = {
  userId: number;
  nickname: string;
  imageUrl: string;
  followerCount: number;
  followingCount: number;
  mentoringStatus: MentoringStatus;
  me: boolean;
  following: boolean;
};

export type UserListData = {
  hasAcceptedMentor: boolean;
  users: UserItem[];
  nextCursor: number | null;
  hasNext: boolean;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const userListQueryKeys = {
  userList: ["user-list"] as const,
};

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchUserList(cursor?: number): Promise<UserListData> {
  const params = cursor !== undefined ? `?cursor=${cursor}` : "";
  const res = await fetchClient.get<ApiResponse<UserListData>>(
    `/api/users${params}`,
  );
  return res.data;
}

// ─── React Query Hook ─────────────────────────────────────────────────────────

export function useUserListInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: userListQueryKeys.userList,
    queryFn: ({ pageParam }) => fetchUserList(pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
