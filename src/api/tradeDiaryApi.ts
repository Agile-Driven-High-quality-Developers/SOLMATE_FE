import { fetchClient } from "@/lib/fetchClient";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "./authApi";

export type MyDiariesItem = {
  diaryId: string;
  tradeType: string;
  stockName: string;
  filledPrice: number;
  quantity: number;
  profit: number;
  content: string;
  commentCount: number;
  createdAt: string;
};

export const myDiariesQueryKeys = {
  stocks: ["my-diaries"] as const,
};

// ─── React Query Hooks ────────────────────────────────────────────────────────

export function useMyDiariesQuery() {
  return useQuery({
    queryKey: myDiariesQueryKeys.stocks,
    queryFn: () =>
      fetchClient
        .get<ApiResponse<MyDiariesItem[]>>("/api/diaries/my")
        .then((res) => {
          return res.data;
        }),
    staleTime: 30_000,
  });
}
