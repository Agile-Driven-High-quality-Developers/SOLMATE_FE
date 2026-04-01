import { fetchClient } from "@/lib/fetchClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "./authApi";

export type MyDiariesItem = {
  diaryId: string;
  tradeType: string;
  stockName: string;
  tickerCode: string;
  filledPrice: number;
  quantity: number;
  profit: number;
  content: string;
  commentCount: number;
  createdAt: string;
};

export type DiaryComment = {
  commentId: number;
  nickname: string;
  imageUrl?: string;
  isMentor: boolean;
  content: string;
};

export type DiaryDetail = {
  diaryId: number;
  tradeType: string;
  stockName: string;
  tickerCode: string;
  filledPrice: number;
  quantity: number;
  profit: number;
  profitRate: number;
  content: string;
  createdAt: string;
  comments: DiaryComment[];
};

export const myDiariesQueryKeys = {
  myDiaries: ["my-diaries"] as const,
  diaryDetail: (diaryId: string) => ["diary-detail", diaryId] as const,
};

// ─── React Query Hooks ────────────────────────────────────────────────────────

export function useMyDiariesQuery() {
  return useQuery({
    queryKey: myDiariesQueryKeys.myDiaries,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MyDiariesItem[]>>("/api/diaries/my")
        .then((res) => {
          return res.data;
        }),
    staleTime: 30_000,
  });
}

export function useDiaryDetailQuery(diaryId: string) {
  return useQuery({
    queryKey: myDiariesQueryKeys.diaryDetail(diaryId),
    queryFn: () =>
      fetchClient
        .get<ApiResponse<DiaryDetail>>(`/api/diaries/${diaryId}`)
        .then((res) => res.data),
    staleTime: 30_000,
    enabled: !!diaryId,
  });
}

export function useModifyDiaryMutation(diaryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      fetchClient.patch(`/api/diaries/${diaryId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.diaryDetail(diaryId),
      });
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.myDiaries,
      });
    },
  });
}

export function usePostCommentMutation(diaryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      fetchClient.post(`/api/diaries/${diaryId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.diaryDetail(diaryId),
      });
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.myDiaries,
      });
      queryClient.invalidateQueries({ queryKey: ["mentor"] });
    },
  });
}


export function useModifyCommentMutation(diaryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      fetchClient.patch(`/api/comments/${commentId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.diaryDetail(diaryId),
      });
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.myDiaries,
      });
      queryClient.invalidateQueries({ queryKey: ["mentor"] });
    },
  });
}

export function useDeleteCommentMutation(diaryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      fetchClient.delete(`/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.diaryDetail(diaryId),
      });
      queryClient.invalidateQueries({
        queryKey: myDiariesQueryKeys.myDiaries,
      });
      queryClient.invalidateQueries({ queryKey: ["mentor"] });
    },
  });
}