import { useMyDiariesQuery } from "@/api/tradeDiaryApi";
import { Search } from "lucide-react";
import { useState } from "react";
import type { MyDiariesItem } from "@/api/tradeDiaryApi";
import Badge from "@/components/ui/Badge";

function MyDiariesRow({ myDiaries }: { myDiaries: MyDiariesItem }) {
  const isBuy = myDiaries.tradeType === "BUY";
  const hasProfit = myDiaries.profit !== 0;
  const isPositive = myDiaries.profit > 0;

  return (
    <div className="flex flex-col gap-2 px-6 py-5 border-b border-gray-100 last:border-b-0">
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
        {hasProfit && (
          <span
            className={`text-[14px] font-semibold ${
              isPositive ? "text-[#0046FF]" : "text-[#FF4444]"
            }`}
          >
            {isPositive ? "+" : ""}
            {myDiaries.profit?.toLocaleString()}원
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
  const [search, setSearch] = useState("");
  const { data: myDiaries = [] } = useMyDiariesQuery();

  const filtered = myDiaries
    .filter((s) => s.stockName.toLowerCase().includes(search.toLowerCase()))
    .slice();

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">매매일지</h1>
      </div>
      {/* 검색 + 정렬 */}
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

      {/* 매매일지 리스트 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <MyDiariesRow key={item.diaryId} myDiaries={item} />
          ))
        ) : (
          <div className="text-center py-12 text-[14px] text-gray-400">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
