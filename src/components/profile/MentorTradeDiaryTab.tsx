import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useUser } from "@/store/authStore";
import { useMyProfileQuery, useUserListQuery } from "@/api/userListApi";
import type { MyDiariesItem } from "@/api/tradeDiaryApi";
import {
  useDiaryDetailQuery,
  usePostCommentMutation,
  useModifyCommentMutation,
  useDeleteCommentMutation,
} from "@/api/tradeDiaryApi";
import { useStocksQuery } from "@/api/stockApi";

type Props = {
  items: MyDiariesItem[];
};

// ─── 유틸리티 함수 ────────────────────────────────────────────────────────────

function formatDateTime(createdAt: string) {
  const date = new Date(createdAt);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${hh}:${mm}`;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function formatTotal(price: number, quantity: number) {
  const total = price * quantity;
  const manwon = total / 10000;
  return `${manwon % 1 === 0 ? manwon : manwon.toFixed(1)}만원`;
}

function formatDate(createdAt: string) {
  const d = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(d, today)) return "오늘";
  if (isSameDay(d, yesterday)) return "어제";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatTime(createdAt: string) {
  const d = new Date(createdAt);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function groupByDate(items: MyDiariesItem[]) {
  const map = new Map<string, MyDiariesItem[]>();
  for (const item of items) {
    const key = formatDate(item.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries());
}

// ─── Diary Detail View ──────────────────────────────────────────────────────

function DiaryDetail({
  diaryId,
  onBack,
}: {
  diaryId: string;
  onBack: () => void;
}) {
  const user = useUser();
  const { data: myProfile } = useMyProfileQuery();
  const { data: userListData } = useUserListQuery();
  const imageUrlMap = new Map(
    (userListData?.users ?? []).map((u) => [u.nickname, u.imageUrl]),
  );
  const { data: detail, isLoading } = useDiaryDetailQuery(diaryId);
  const { mutate: postComment, isPending } = usePostCommentMutation(diaryId);
  const { mutate: modifyComment } = useModifyCommentMutation(diaryId);
  const { mutate: deleteComment } = useDeleteCommentMutation(diaryId);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");

  if (isLoading) {
    return (
      <div className="py-12 text-center text-[14px] text-gray-400 dark:text-slate-500">
        불러오는 중...
      </div>
    );
  }

  if (!detail) return null;

  const isBuy = detail.tradeType === "BUY";
  const tradeTypeLabel = isBuy ? "매수" : "매도";
  const isProfit = (detail.profit ?? 0) >= 0;
  const profitColor = isProfit ? "text-red-500" : "text-blue-500";

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-fit"
      >
        <ChevronLeft size={16} />
        매매일지 목록
      </button>

      {/* 일지 상세 카드 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[11px] font-bold text-white rounded ${isBuy ? "bg-red-500" : "bg-blue-600"}`}
            >
              {tradeTypeLabel}
            </span>
            <span className="text-[18px] font-bold text-gray-900 dark:text-gray-100">
              {detail.stockName}
            </span>
            <span className="text-[12px] text-gray-400 dark:text-slate-500 tabular-nums">
              {detail.tickerCode}
            </span>
          </div>
          {detail.tradeType === "SELL" && (
            <p className={`text-[17px] font-bold tabular-nums ${profitColor}`}>
              {isProfit ? "+" : ""}
              {detail.profit.toLocaleString()} 원
            </p>
          )}
        </div>

        <p className="text-[12px] text-gray-400 dark:text-slate-500">
          {detail.quantity}주 · {formatPrice(detail.filledPrice)} ·{" "}
          {formatDateTime(detail.createdAt)}
        </p>

        {/* 체결 수치 그리드 */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden bg-gray-50/30 dark:bg-slate-800/20">
          {[
            { label: "체결수량", value: `${detail.quantity}주` },
            {
              label: "체결가격",
              value: detail.filledPrice ? formatPrice(detail.filledPrice) : "-",
            },
            {
              label: "총 체결금액",
              value: formatTotal(detail.filledPrice, detail.quantity),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-3 gap-1">
              <span className="text-[12px] text-gray-400 dark:text-slate-500">
                {label}
              </span>
              <span className="text-[12px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[12px] text-gray-400 dark:text-slate-500 mb-2">
            매매 일지
          </p>
          <div className="p-4 bg-gray-50/50 dark:bg-slate-800/40 rounded-xl border border-gray-50 dark:border-slate-800">
            <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed break-keep">
              {detail.content}
            </p>
          </div>
        </div>
      </div>

      {/* 댓글 카드 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-5">
        <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
          댓글 ({detail.comments?.length ?? 0})
        </p>

        <div className="flex flex-col gap-5">
          {detail.comments?.map((comment) => (
            <div key={comment.commentId} className="flex gap-3 group">
              <Avatar
                name={comment.nickname}
                src={imageUrlMap.get(comment.nickname) || comment.imageUrl}
                size={32}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-gray-900 dark:text-gray-200">
                      {comment.nickname}
                    </span>
                    {comment.isMentor && <Badge name="멘토" color="#FF9900" />}
                  </div>
                  {user?.nickname === comment.nickname &&
                    editingCommentId !== comment.commentId && (
                      <div className="flex items-center gap-2">
                        <button
                          className="text-[12px] font-medium text-gray-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
                          onClick={() => {
                            setEditingCommentId(comment.commentId);
                            setEditInput(comment.content);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="text-[12px] font-medium text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                          onClick={() => deleteComment(comment.commentId)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                </div>
                {editingCommentId === comment.commentId ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="w-full px-3 py-2 text-[12px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none ring-1 ring-transparent focus:ring-[#0046FF] focus:border-[#0046FF] transition-all"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="basic"
                        className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0046FF] rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          if (!editInput.trim()) return;
                          modifyComment(
                            {
                              commentId: comment.commentId,
                              content: editInput,
                            },
                            { onSuccess: () => setEditingCommentId(null) },
                          );
                        }}
                      >
                        저장
                      </Button>
                      <button
                        className="px-3 py-1 text-[12px] font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={() => setEditingCommentId(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 댓글 입력 영역 */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-2">
          <div className="flex items-center gap-3">
            <Avatar
              name={user?.nickname ?? ""}
              src={myProfile?.imageUrl}
              size={32}
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.nativeEvent.isComposing &&
                    commentInput.trim()
                  ) {
                    postComment(commentInput, {
                      onSuccess: () => setCommentInput(""),
                    });
                  }
                }}
                placeholder="멘토에게 질문해보세요."
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 rounded-2xl outline-none focus:ring-2 focus:ring-[#0046FF]/20 focus:border-[#0046FF] transition-all"
              />
              <button
                disabled={isPending || !commentInput.trim()}
                onClick={() =>
                  postComment(commentInput, {
                    onSuccess: () => setCommentInput(""),
                  })
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#0046FF] rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:grayscale"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab List View ─────────────────────────────────────────────────────

export default function MentorTradeDiaryTab({ items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: stocks = [] } = useStocksQuery();
  const logoMap = new Map(stocks.map((s) => [s.stockName, s.stockLogo]));

  if (selectedId) {
    return (
      <DiaryDetail diaryId={selectedId} onBack={() => setSelectedId(null)} />
    );
  }

  const filtered = items.filter((item) =>
    item.stockName.toLowerCase().includes(search.toLowerCase()),
  );
  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
        />
        <input
          type="text"
          placeholder="종목명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-[14px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#0046FF] transition-colors dark:text-gray-100 dark:placeholder:text-slate-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[14px] text-gray-400 dark:text-slate-500">
          {search
            ? "검색 결과가 없습니다."
            : "조회할 수 있는 매매일지가 없습니다."}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([dateLabel, groupItems]) => (
            <div key={dateLabel} className="flex flex-col gap-2">
              <p className="text-[12px] font-bold text-gray-400 dark:text-slate-500 px-1 uppercase tracking-tight">
                {dateLabel}
              </p>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden divide-y divide-gray-50 dark:divide-slate-800 shadow-sm">
                {groupItems.map((item) => {
                  const isBuy = item.tradeType === "BUY";
                  const isPositive = item.profit > 0;
                  const isNegative = item.profit < 0;
                  return (
                    <div
                      key={item.diaryId}
                      onClick={() => setSelectedId(item.diaryId)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:w-48 sm:shrink-0">
                        <Avatar
                          name={item.stockName}
                          src={logoMap.get(item.stockName)}
                          size={40}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[16px] font-bold text-gray-900 dark:text-gray-100 truncate">
                              {item.stockName}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded text-white ${isBuy ? "bg-red-500" : "bg-blue-600"}`}
                            >
                              {isBuy ? "매수" : "매도"}
                            </span>
                          </div>
                          <span className="text-[12px] text-gray-400 dark:text-slate-500 tabular-nums">
                            {item.quantity}주 ·{" "}
                            {item.filledPrice?.toLocaleString()}원
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-1 items-start justify-between gap-4 min-w-0">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-1">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                              {formatTime(item.createdAt)}
                            </span>
                            {item.commentCount > 0 && (
                              <span className="text-[11px] text-[#0046FF] dark:text-blue-400 font-medium">
                                댓글 {item.commentCount}
                              </span>
                            )}
                          </div>
                        </div>
                        {!isBuy && (
                          <span
                            className={`text-[12px] font-bold shrink-0 tabular-nums ${
                              isPositive
                                ? "text-red-500"
                                : isNegative
                                  ? "text-blue-500"
                                  : "text-gray-500 dark:text-slate-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {item.profit?.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
