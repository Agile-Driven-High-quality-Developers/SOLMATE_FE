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
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useUser, useAuthStore } from "@/store/authStore";
import Badge from "@/components/ui/Badge";
import { useUserListQuery } from "@/api/userListApi";

function formatProfitRate(rate: number) {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

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
  const { mutate: modifyDiary, isPending: isSavingDiary } = useModifyDiaryMutation(diaryId);
  const { data: userListData } = useUserListQuery();
  const imageUrlMap = new Map(
    (userListData?.users ?? []).map((u) => [u.nickname, u.imageUrl])
  );

  const isProfit = (diary?.profit ?? 0) >= 0;
  const profitColor = isProfit ? "text-[#FF4444]" : "text-[#0046FF]";
  const tradeTypeLabel = diary?.tradeType === "BUY" ? "매수" : "매도";
  const tradeTypeBg =
    diary?.tradeType === "BUY" ? "bg-[#FF4444]" : "bg-[#0046FF]";
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/trade-diary")}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-400 text-[14px]">매매일지</span>
          <span className="text-gray-300 text-[14px]">›</span>
          <span className="text-[14px] font-semibold text-gray-900">
            매매일지 상세
          </span>
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
        {isLoading && (
          <p className="text-[14px] text-gray-400 text-center py-8">
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
                <span className="text-[18px] font-bold text-gray-900">
                  {diary.stockName}
                </span>
                <span className="text-[12px] text-gray-400">
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
                    className="text-gray-300 hover:text-[#0046FF] transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* 체결 요약 */}
            <p className="text-[13px] text-gray-400">
              {diary.quantity}주 · {formatPrice(diary.filledPrice)} ·{" "}
              {formatDateTime(diary.createdAt)}
            </p>

            {/* 체결 상세 */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
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
                  className="flex flex-col items-center py-3 gap-1"
                >
                  <span className="text-[12px] text-gray-400">{label}</span>
                  <span className="text-[14px] font-semibold text-gray-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* 매매 일지 */}
            <div>
              <p className="text-[14px] text-gray-400 mb-1">매매 일지</p>
              {isEditingDiary ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={diaryEditContent}
                    onChange={(e) => setDiaryEditContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 text-[15px] bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0046FF] transition-colors resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingDiary(false)}
                      className="px-4 py-1.5 text-[13px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                <p className="text-[16px] text-gray-700 leading-relaxed">
                  {diary.content}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 댓글 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
        <p className="text-[14px] font-semibold text-gray-900">
          댓글 ({diary?.comments?.length ?? 0})
        </p>

        {/* 댓글 목록 */}
        <div className="flex flex-col gap-3">
          {diary?.comments?.map((comment) => (
            <div key={comment.commentId} className="flex gap-3">
              <Avatar name={comment.nickname} src={imageUrlMap.get(comment.nickname) || comment.imageUrl || undefined} size={32} />
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-gray-900">
                      {comment.nickname}
                    </span>
                    {comment.isMentor && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <Badge name="멘토" color="#FF9900" />
                      </span>
                    )}
                  </div>
                  {user?.nickname === comment.nickname && editingCommentId !== comment.commentId && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="basic"
                        className="text-[11px] px-2 py-0.5"
                        onClick={() => {
                          setEditingCommentId(comment.commentId);
                          setEditInput(comment.content);
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="basic"
                        className="text-[11px] px-2 py-0.5 border-red-500! text-red-500! hover:bg-red-50!"
                        onClick={() => deleteComment(comment.commentId)}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.commentId ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0046FF] transition-colors"
                    />
                    <Button
                      variant="basic"
                      className="text-[12px] px-2 py-0.5"
                      onClick={() => {
                        if (!editInput.trim()) return;
                        modifyComment(
                          { commentId: comment.commentId, content: editInput },
                          { onSuccess: () => setEditingCommentId(null) },
                        );
                      }}
                    >
                      저장
                    </Button>
                    <Button
                      variant="basic"
                      className="text-[12px] px-2 py-0.5"
                      onClick={() => setEditingCommentId(null)}
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 댓글 입력 */}
        <div className="flex items-center gap-2">
          <Avatar name={user?.nickname ?? ""} src={storeUser?.imageUrl || undefined} size={32} />
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-4 py-2 text-[14px] bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0046FF] transition-colors"
          />
          <button
            disabled={isPending}
            onClick={() => {
              if (!commentInput.trim()) return;
              postComment(commentInput, {
                onSuccess: () => setCommentInput(""),
              });
            }}
            className="px-4 py-2 text-[14px] font-semibold text-white bg-[#0046FF] rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
