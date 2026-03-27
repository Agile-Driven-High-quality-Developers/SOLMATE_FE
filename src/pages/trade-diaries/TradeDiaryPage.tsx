import { useMyDiariesQuery } from "@/api/tradeDiaryApi";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MyDiariesItem } from "@/api/tradeDiaryApi";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const DIARY_TOUR: TourStep[] = [
  {
    target: "diary-list",
    title: "✍️ 나만의 투자 기록",
    description: "매수·매도할 때 남긴 메모가 여기에 쌓여요. 왜 그 주식을 샀는지 기록해두면 나중에 내 투자 패턴을 볼 수 있어요.",
    placement: "bottom",
  },
];
import Badge from "@/components/ui/Badge";

function MyDiariesRow({
  myDiaries,
  onClick,
}: {
  myDiaries: MyDiariesItem;
  onClick: () => void;
}) {
  const isBuy = myDiaries.tradeType === "BUY";
  const isPositive = myDiaries.profit > 0;

  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2 px-6 py-5 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
    >
      {/* 상단: 뱃지 + 종목명 + 수량/가격/날짜 + 수익 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            name={isBuy ? "매수" : "매도"}
            color={isBuy ? "#FF4444" : "#0046FF"}
          />
          <span className="text-[16px] font-bold text-gray-900">
            {myDiaries.stockName}
          </span>
          <span className="text-[14px] text-gray-400">
            {myDiaries.quantity}주
          </span>
          <span className="text-gray-300 text-[13px]">·</span>
          <span className="text-[14px] text-gray-400">
            {myDiaries.filledPrice?.toLocaleString()}원
          </span>
          <span className="text-gray-300 text-[13px]">·</span>
          <span className="text-[14px] text-gray-400">
            {myDiaries.createdAt.slice(0, 10).replace(/-/g, ".")}
          </span>
        </div>
        {!isBuy && (
          <span
            className={`text-[14px] font-semibold ${
              isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
            }`}
          >
            {isPositive
              ? `+${myDiaries.profit?.toLocaleString()}원`
              : ` ${myDiaries.profit?.toLocaleString()}원`}
          </span>
        )}
      </div>

      {/* 본문 */}
      <p className="text-[14px] text-gray-700 leading-relaxed">
        {myDiaries.content}
      </p>

      {/* 하단: 댓글 */}
      {myDiaries.commentCount > 0 && (
        <div className="flex items-center gap-1 text-gray-400">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[12px]">댓글 {myDiaries.commentCount}개</span>
        </div>
      )}
    </div>
  );
}

export default function TradeDiaryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: myDiaries = [] } = useMyDiariesQuery();

  const filtered = myDiaries
    .filter((s) => s.stockName.toLowerCase().includes(search.toLowerCase()))
    .slice();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 + 검색 (고정) */}
      <div className="flex flex-col gap-5 p-6 pb-4 shrink-0">
        <h1 className="text-[22px] font-bold text-gray-900">매매일지</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="종목명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0046FF] transition-colors"
            />
          </div>
        </div>
      </div>

      <SpotlightTour tourKey="diary" steps={DIARY_TOUR} />

      {/* 매매일지 리스트 (스크롤) */}
      <div className="flex-1 overflow-y-auto px-6 pb-6" data-tour="diary-list">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-y-scroll h-full">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <MyDiariesRow
                key={item.diaryId}
                myDiaries={item}
                onClick={() => navigate(`/trade-diary/${item.diaryId}`)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-[14px] text-gray-400">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
