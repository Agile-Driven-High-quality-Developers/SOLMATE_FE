import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import {
  useDiaryDetailQuery,
  usePostCommentMutation,
  useModifyCommentMutation,
  useDeleteCommentMutation,
} from "@/api/tradeDiaryApi";
import Button from "@/components/ui/Button";
import { useUser } from "@/store/authStore";
import Badge from "@/components/ui/Badge";

function formatProfitRate(rate: number) {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
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
  const user = useUser();
  const diaryId = tradeDiaryId ?? "";
  const { mutate: postComment, isPending } = usePostCommentMutation(diaryId);
  const { mutate: modifyComment } = useModifyCommentMutation(diaryId);
  const { mutate: deleteComment } = useDeleteCommentMutation(diaryId);

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
        <button className="text-gray-400 hover:text-gray-700">
          <Pencil size={16} />
        </button>
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
              {diary?.tradeType === "SELL" && (
                <div className="text-right">
                  <p className={`text-[16px] font-bold ${profitColor}`}>
                    {isProfit ? "+" : ""}
                    {diary.profit.toLocaleString()} 원
                  </p>
                </div>
              )}
            </div>

            {/* 체결 요약 */}
            <p className="text-[13px] text-gray-400">
              {diary.quantity}주 · {formatPrice(diary.filledPrice)} ·{" "}
              {formatDate(diary.createdAt)}
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
              <p className="text-[16px] text-gray-700 leading-relaxed">
                {diary.content}
              </p>
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
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[12px] font-bold shrink-0">
                {comment.nickname.charAt(0)}
              </div>
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
                  {user?.nickname === comment.nickname && (
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
          <div className="w-8 h-8 rounded-full bg-[#0046FF] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
            투
          </div>
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
