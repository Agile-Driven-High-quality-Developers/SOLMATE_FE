import { useMyDiariesQuery } from "@/api/tradeDiaryApi";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MyDiariesItem } from "@/api/tradeDiaryApi";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { useStocksQuery } from "@/api/stockApi";

const DIARY_TOUR: TourStep[] = [
  {
    target: "diary-list",
    title: "✍️ 나만의 투자 기록",
    description:
      "매수·매도할 때 남긴 메모가 여기에 쌓여요. 왜 그 주식을 샀는지 기록해두면 나중에 내 투자 패턴을 볼 수 있어요.",
    placement: "bottom",
  },
];

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

function DiaryCard({
  item,
  logoUrl,
  onClick,
}: {
  item: MyDiariesItem;
  logoUrl?: string;
  onClick: () => void;
}) {
  const isBuy = item.tradeType === "BUY";
  const isPositive = item.profit > 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* 왼쪽: 종목 정보 */}
      <div className="flex items-center gap-3 w-52 shrink-0">
        <Avatar name={item.stockName} src={logoUrl} size={40} />
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-bold text-gray-900">
              {item.stockName}
            </span>
            <Badge
              name={isBuy ? "매수" : "매도"}
              color={isBuy ? "#FF4444" : "#0046FF"}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-400">
              {item.quantity}주 · {item.filledPrice?.toLocaleString()}원
            </span>
          </div>
          <span className="text-[12px] text-gray-400">
            {formatTime(item.createdAt)}
          </span>
        </div>
      </div>

      {/* 오른쪽: 일지 내용 + 수익 */}
      <div className="flex flex-1 items-start justify-between gap-4 min-w-0">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-[14px] text-gray-700 leading-relaxed line-clamp-2">
            {item.content}
          </p>
          {item.commentCount > 0 && (
            <span className="text-[11px] text-gray-400 mt-2">
              댓글 {item.commentCount}
            </span>
          )}
        </div>
        {!isBuy && (
          <span
            className={`text-[15px] font-bold shrink-0 ${
              isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
            }`}
          >
            {isPositive ? "+" : ""}
            {item.profit?.toLocaleString()}원
          </span>
        )}
      </div>
    </div>
  );
}

export default function TradeDiaryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: myDiaries = [], isLoading } = useMyDiariesQuery();
  const { data: stocks = [] } = useStocksQuery();
  const logoMap = new Map(stocks.map((s) => [s.stockName, s.stockLogo]));

  const filtered = myDiaries.filter((s) =>
    s.stockName.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <h1 className="text-[22px] font-bold text-gray-900">매매일지</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          나의 매매 기록을 확인하세요
        </p>
      </div>

      {/* 검색 */}
      <div className="px-6 pb-4 shrink-0">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="종목명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#0046FF] transition-colors"
          />
        </div>
      </div>

      <SpotlightTour tourKey="diary" steps={DIARY_TOUR} />
      {/* 리스트 */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5"
        data-tour="diary-list"
      >
        {isLoading && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-400">
            <p className="text-[15px] font-medium">매매일지가 없어요</p>
            <p className="text-[13px]">
              {search ? "검색 결과가 없습니다." : "아직 작성된 일지가 없어요."}
            </p>
          </div>
        )}

        {grouped.map(([dateLabel, items]) => (
          <div key={dateLabel} className="flex flex-col gap-1">
            {/* 날짜 헤더 */}
            <p className="text-[12px] font-semibold text-gray-400 px-1 mb-1">
              {dateLabel}
            </p>

            {/* 카드 묶음 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {items.map((item) => (
                <DiaryCard
                  key={item.diaryId}
                  item={item}
                  logoUrl={logoMap.get(item.stockName)}
                  onClick={() => navigate(`/trade-diary/${item.diaryId}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
