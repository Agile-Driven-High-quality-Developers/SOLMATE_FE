import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { useUser } from "@/store/authStore";
import { useMyProfileQuery } from "@/api/userListApi";
import type { MyDiariesItem } from "@/api/tradeDiaryApi";

type Props = {
  items: MyDiariesItem[];
  onAskQuestion?: (diaryId: number, content: string) => Promise<void>;
};

function QuestionInput({ diaryId, onSubmit }: { diaryId: number; onSubmit: (diaryId: number, content: string) => Promise<void> }) {
  const user = useUser();
  const { data: myProfile } = useMyProfileQuery();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(diaryId, value.trim());
      setValue("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <Avatar name={user?.nickname ?? ""} src={myProfile?.imageUrl} size={28} />
      <div className="flex flex-1 items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#0046FF] transition-colors">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="멘토에게 질문하기..."
          className="flex-1 text-[13px] outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          className="text-[12px] font-semibold text-white bg-[#0046FF] px-3 py-1 rounded-lg disabled:opacity-40 transition-opacity shrink-0"
        >
          {loading ? "등록 중" : "등록"}
        </button>
      </div>
    </div>
  );
}

export default function MentorTradeDiaryTab({ items, onAskQuestion }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[14px] text-gray-400">
        매매일지가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const isBuy = item.tradeType === "BUY";
        const isPositive = (item.profit ?? 0) >= 0;

        return (
          <div
            key={item.diaryId}
            className="flex flex-col gap-2 px-6 py-5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge name={isBuy ? "매수" : "매도"} color={isBuy ? "#FF4444" : "#0046FF"} />
                <span className="text-[15px] font-bold text-gray-900">{item.stockName}</span>
                <span className="text-[13px] text-gray-400">{item.quantity}주</span>
                <span className="text-gray-300">·</span>
                <span className="text-[13px] text-gray-400">{item.filledPrice?.toLocaleString() ?? "-"}원</span>
                <span className="text-gray-300">·</span>
                <span className="text-[13px] text-gray-400">{item.createdAt.slice(0, 10).replace(/-/g, ".")}</span>
              </div>
              {item.profit != null && item.profit !== 0 && (
                <span className={`text-[13px] font-semibold ${isPositive ? "text-[#FF4444]" : "text-[#0046FF]"}`}>
                  {isPositive ? "+" : ""}{item.profit?.toLocaleString()}원
                </span>
              )}
            </div>
            <p className="text-[14px] text-gray-700 leading-relaxed">{item.content}</p>
            {onAskQuestion && (
              <QuestionInput diaryId={item.diaryId} onSubmit={onAskQuestion} />
            )}
          </div>
        );
      })}
    </div>
  );
}
