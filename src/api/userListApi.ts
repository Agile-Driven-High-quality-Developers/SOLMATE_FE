import { fetchClient } from "@/lib/fetchClient";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
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

export async function followUser(userId: number): Promise<void> {
  await fetchClient.post(`/api/follows/${userId}`);
}

export async function unfollowUser(userId: number): Promise<void> {
  await fetchClient.delete(`/api/follows/${userId}`);
}

export async function requestMentoring(mentorUserId: number): Promise<void> {
  await fetchClient.post("/api/mentor-requests", { mentorUserId });
}

export async function cancelMentoring(mentorUserId: number): Promise<void> {
  await fetchClient.delete(`/api/mentor-requests/${mentorUserId}`);
}

// ─── Cache Updater ────────────────────────────────────────────────────────────

type InfiniteData = { pages: UserListData[]; pageParams: unknown[] };

export function useUserListCacheUpdate() {
  const queryClient = useQueryClient();

  function updateCache(updater: (data: InfiniteData) => InfiniteData) {
    queryClient.setQueryData<InfiniteData>(userListQueryKeys.userList, (old) =>
      old ? updater(old) : old,
    );
  }

  function toggleFollow(userId: number, newFollowing: boolean) {
    updateCache((old) => ({
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        users: page.users.map((u) =>
          u.userId === userId ? { ...u, following: newFollowing } : u,
        ),
      })),
    }));
  }

  function setMentoringStatus(
    userId: number,
    status: MentoringStatus,
    hasAcceptedMentor: boolean,
  ) {
    updateCache((old) => ({
      ...old,
      pages: old.pages.map((page, i) => ({
        ...page,
        hasAcceptedMentor: i === 0 ? hasAcceptedMentor : page.hasAcceptedMentor,
        users: page.users.map((u) =>
          u.userId === userId ? { ...u, mentoringStatus: status } : u,
        ),
      })),
    }));
  }

  return { toggleFollow, setMentoringStatus };
}

// ─── My Profile ───────────────────────────────────────────────────────────────

export type MyProfile = {
  userId: number;
  nickname: string;
  imageUrl: string;
  followerCount: number;
  followingCount: number;
};

export function useMyProfileQuery() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MyProfile>>("/api/users/me")
        .then((res) => res.data),
    staleTime: 30_000,
  });
}

// ─── Follow List Types ────────────────────────────────────────────────────────

export type FollowUser = {
  userId: number;
  nickname: string;
  imageUrl: string;
};

// ─── Follow List Hooks ────────────────────────────────────────────────────────

type FollowListData = {
  users: FollowUser[];
  nextCursor: number | null;
  hasNext: boolean;
};

export function useFollowersQuery() {
  return useQuery({
    queryKey: ["follows", "followers"],
    queryFn: () =>
      fetchClient
        .get<ApiResponse<FollowListData>>("/api/users/me/followers")
        .then((res) => res.data.users),
  });
}

export function useFollowingQuery() {
  return useQuery({
    queryKey: ["follows", "following"],
    queryFn: () =>
      fetchClient
        .get<ApiResponse<FollowListData>>("/api/users/me/following")
        .then((res) => res.data.users),
  });
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
