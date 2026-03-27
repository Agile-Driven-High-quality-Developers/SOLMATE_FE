import { fetchClient } from "@/lib/fetchClient";
import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const userListQueryKeys = {
  userList: ["user-list"] as const,
};

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchUserList(): Promise<UserListData> {
  const res = await fetchClient.get<ApiResponse<UserListData>>("/api/users");
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

export function useUserListCacheUpdate() {
  const queryClient = useQueryClient();

  function updateCache(updater: (data: UserListData) => UserListData) {
    queryClient.setQueryData<UserListData>(userListQueryKeys.userList, (old) =>
      old ? updater(old) : old,
    );
  }

  function toggleFollow(userId: number, newFollowing: boolean) {
    updateCache((old) => ({
      ...old,
      users: old.users.map((u) =>
        u.userId === userId
          ? { ...u, following: newFollowing, followerCount: u.followerCount + (newFollowing ? 1 : -1) }
          : u,
      ),
    }));
  }

  function setMentoringStatus(
    userId: number,
    status: MentoringStatus,
    hasAcceptedMentor: boolean,
  ) {
    updateCache((old) => ({
      ...old,
      hasAcceptedMentor,
      users: old.users.map((u) =>
        u.userId === userId ? { ...u, mentoringStatus: status } : u,
      ),
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
  provider: "EMAIL" | "GOOGLE";
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

export function useFollowersInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ["follows", "followers"],
    queryFn: ({ pageParam }) => {
      const params = pageParam !== undefined ? `?cursor=${pageParam}` : "";
      return fetchClient
        .get<ApiResponse<FollowListData>>(`/api/users/me/followers${params}`)
        .then((res) => res.data);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useFollowingInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ["follows", "following"],
    queryFn: ({ pageParam }) => {
      const params = pageParam !== undefined ? `?cursor=${pageParam}` : "";
      return fetchClient
        .get<ApiResponse<FollowListData>>(`/api/users/me/following${params}`)
        .then((res) => res.data);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useUserFollowersInfiniteQuery(userId: number) {
  return useInfiniteQuery({
    queryKey: ["follows", userId, "followers"],
    queryFn: ({ pageParam }) => {
      const params = pageParam !== undefined ? `?cursor=${pageParam}` : "";
      return fetchClient
        .get<ApiResponse<FollowListData>>(`/api/users/${userId}/followers${params}`)
        .then((res) => res.data);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: !!userId,
  });
}

export function useUserFollowingInfiniteQuery(userId: number) {
  return useInfiniteQuery({
    queryKey: ["follows", userId, "following"],
    queryFn: ({ pageParam }) => {
      const params = pageParam !== undefined ? `?cursor=${pageParam}` : "";
      return fetchClient
        .get<ApiResponse<FollowListData>>(`/api/users/${userId}/following${params}`)
        .then((res) => res.data);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: !!userId,
  });
}

// ─── React Query Hook ─────────────────────────────────────────────────────────

export function useUserListQuery() {
  return useQuery({
    queryKey: userListQueryKeys.userList,
    queryFn: fetchUserList,
  });
}

// HomePage 호환용 래퍼 (pages 구조 유지)
export function useUserListInfiniteQuery() {
  const query = useUserListQuery();
  return {
    ...query,
    data: query.data ? { pages: [query.data], pageParams: [undefined] } : undefined,
  };
}
