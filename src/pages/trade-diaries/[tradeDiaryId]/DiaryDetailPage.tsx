import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import {
  useDiaryDetailQuery,
  useModifyDiaryMutation,
  usePostCommentMutation,
  useModifyCommentMutation,
  useDeleteCommentMutation,
} from "@/api/tradeDiaryApi";
import Avatar from "@/components/ui/Avatar";
import { useUser, useAuthStore } from "@/store/authStore";

import Badge from "@/components/ui/Badge";
import { useUserListQuery } from "@/api/userListApi";
import DiaryMiniChart from "@/components/profile/DiaryMiniChart";

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

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const { tradeDiaryId } = useParams<{ tradeDiaryId: string }>();
  const {
    data: diary,
    isLoading,
    isError,
  } = useDiaryDetailQuery(tradeDiaryId ?? "");
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");
  const [isEditingDiary, setIsEditingDiary] = useState(false);
  const [diaryEditContent, setDiaryEditContent] = useState("");
  const user = useUser();
  const storeUser = useAuthStore((s) => s.user);
  const diaryId = tradeDiaryId ?? "";
  const { mutate: postComment, isPending } = usePostCommentMutation(diaryId);
  const { mutate: modifyComment } = useModifyCommentMutation(diaryId);
  const { mutate: deleteComment } = useDeleteCommentMutation(diaryId);
  const { mutate: modifyDiary, isPending: isSavingDiary } =
    useModifyDiaryMutation(diaryId);
  const { data: userListData } = useUserListQuery();
  const imageUrlMap = new Map(
    (userListData?.users ?? []).map((u) => [u.nickname, u.imageUrl]),
  );

  const isProfit = (diary?.profit ?? 0) >= 0;
  const profitColor = isProfit ? "text-[#FF4444]" : "text-[#0046FF]";
  const tradeTypeLabel = diary?.tradeType === "BUY" ? "매수" : "매도";
  const tradeTypeBg =
    diary?.tradeType === "BUY" ? "bg-[#FF4444]" : "bg-[#0046FF]";
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/trade-diary")}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-400 dark:text-slate-500 text-[14px]">
            매매일지
          </span>
          <span className="text-gray-300 dark:text-slate-600 text-[14px]">
            ›
          </span>
          <span className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
            매매일지 상세
          </span>
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-4">
        {isLoading && (
          <p className="text-[14px] text-gray-400 dark:text-slate-500 text-center py-8">
            불러오는 중...
          </p>
        )}
        {isError && (
          <p className="text-[14px] text-red-400 text-center py-8">
            데이터를 불러오지 못했습니다.
          </p>
        )}
        {diary && (
          <>
            {/* 종목 정보 */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[12px] font-semibold text-white ${tradeTypeBg} rounded`}
                >
                  {tradeTypeLabel}
                </span>
                <span className="text-[18px] font-bold text-gray-900 dark:text-gray-100">
                  {diary.stockName}
                </span>
                <span className="text-[12px] text-gray-400 dark:text-slate-500">
                  {diary.tickerCode}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {diary?.tradeType === "SELL" && (
                  <p className={`text-[16px] font-bold ${profitColor}`}>
                    {isProfit ? "+" : ""}
                    {diary.profit.toLocaleString()} 원
                  </p>
                )}
                {!isEditingDiary && (
                  <button
                    onClick={() => {
                      setDiaryEditContent(diary.content);
                      setIsEditingDiary(true);
                    }}
                    className="text-gray-300 dark:text-slate-600 hover:text-[#0046FF] dark:hover:text-[#4d7cff] transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* 체결 요약 */}
            <p className="text-[13px] text-gray-400 dark:text-slate-500">
              {diary.quantity}주 · {formatPrice(diary.filledPrice)} ·{" "}
              {formatDateTime(diary.createdAt)}
            </p>

            {/* 체결 상세 */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
              {[
                { label: "체결수량", value: `${diary.quantity}주` },
                {
                  label: "체결가격",
                  value: diary.filledPrice ? formatPrice(diary.filledPrice) : 0,
                },
                {
                  label: "총 체결금액",
                  value: formatTotal(diary.filledPrice, diary.quantity),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center py-3 gap-1 bg-white dark:bg-slate-900"
                >
                  <span className="text-[12px] text-gray-400 dark:text-slate-500">
                    {label}
                  </span>
                  <span className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* 차트 */}
            {diary.tickerCode && (
              <DiaryMiniChart
                tickerCode={diary.tickerCode}
                tradeDate={diary.createdAt.slice(0, 10)}
                tradeDateTime={diary.createdAt}
                tradeType={diary.tradeType}
                filledPrice={diary.filledPrice}
              />
            )}

            {/* 매매 일지 */}
            <div>
              <p className="text-[14px] font-semibold text-gray-500 dark:text-slate-400 mb-2">
                매매 일지
              </p>
              {isEditingDiary ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={diaryEditContent}
                    onChange={(e) => setDiaryEditContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 text-[15px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none focus:border-[#0046FF] transition-colors resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingDiary(false)}
                      className="px-4 py-1.5 text-[13px] font-medium text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      disabled={isSavingDiary || !diaryEditContent.trim()}
                      onClick={() =>
                        modifyDiary(diaryEditContent, {
                          onSuccess: () => setIsEditingDiary(false),
                        })
                      }
                      className="px-4 py-1.5 text-[13px] font-semibold text-white bg-[#0046FF] rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {diary.content}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-6 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
            댓글
          </p>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[12px] font-bold rounded-full tabular-nums">
            {diary?.comments?.length ?? 0}
          </span>
        </div>

        {/* 댓글 목록 */}
        <div className="flex flex-col gap-5">
          {diary?.comments?.map((comment) => (
            <div key={comment.commentId} className="flex gap-3 group">
              <Avatar
                name={comment.nickname}
                src={
                  imageUrlMap.get(comment.nickname) ||
                  comment.imageUrl ||
                  undefined
                }
                size={34}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
                      {comment.nickname}
                    </span>
                    {comment.isMentor && <Badge name="멘토" color="#FF9900" />}
                  </div>

                  {/* 수정/삭제 버튼: 다크모드에서 가독성 높은 고스트 버튼 스타일 */}
                  {user?.nickname === comment.nickname &&
                    editingCommentId !== comment.commentId && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.commentId);
                            setEditInput(comment.content);
                          }}
                          className="text-[11px] font-medium text-gray-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteComment(comment.commentId)}
                          className="text-[11px] font-medium text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
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
                      autoFocus
                      className="w-full px-3 py-2 text-[13px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-xl outline-none ring-1 ring-transparent focus:ring-[#0046FF] focus:border-[#0046FF] transition-all"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1 text-[12px] font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        취소
                      </button>
                      <button
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
                        className="px-3 py-1 text-[12px] font-bold text-white bg-[#0046FF] rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 댓글 입력창 */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-2">
          <div className="flex items-center gap-3">
            <Avatar
              name={user?.nickname ?? ""}
              src={storeUser?.imageUrl || undefined}
              size={32}
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  // 한글 입력 중 엔터 키 중복 실행 방지 (isComposing 체크)
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
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-2.5 text-[14px] bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 rounded-2xl outline-none focus:ring-2 focus:ring-[#0046FF]/20 focus:border-[#0046FF] transition-all"
              />
              <button
                disabled={isPending || !commentInput.trim()}
                onClick={() =>
                  postComment(commentInput, {
                    onSuccess: () => setCommentInput(""),
                  })
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[13px] font-bold text-white bg-[#0046FF] rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:grayscale"
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
