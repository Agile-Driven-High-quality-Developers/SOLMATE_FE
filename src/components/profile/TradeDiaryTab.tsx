import { useState } from "react";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { MyDiariesItem } from "@/api/tradeDiaryApi";
import { useStocksQuery } from "@/api/stockApi";

type Props = {
  items: MyDiariesItem[];
};

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

export default function TradeDiaryTab({ items }: Props) {
  const [search, setSearch] = useState("");
  const { data: stocks = [] } = useStocksQuery();
  const logoMap = new Map(stocks.map((s) => [s.stockName, s.stockLogo]));

  const filtered = items.filter((item) =>
    item.stockName.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col gap-4">
      {/* 검색 */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="종목명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0046FF] transition-colors"
        />
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[14px] text-gray-400">
          {search ? "검색 결과가 없습니다." : "매매일지가 없습니다."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([dateLabel, groupItems]) => (
            <div key={dateLabel} className="flex flex-col gap-1">
              <p className="text-[12px] font-semibold text-gray-400 px-1 mb-1">{dateLabel}</p>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {groupItems.map((item) => {
                  const isBuy = item.tradeType === "BUY";
                  const isPositive = item.profit > 0;
                  return (
                    <div
                      key={item.diaryId}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      {/* 좌측: 종목 정보 */}
                      <div className="flex items-center gap-3 w-52 shrink-0">
                        <Avatar name={item.stockName} src={logoMap.get(item.stockName)} size={40} />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[15px] font-bold text-gray-900">{item.stockName}</span>
                            <Badge name={isBuy ? "매수" : "매도"} color={isBuy ? "#FF4444" : "#0046FF"} />
                          </div>
                          <span className="text-[12px] text-gray-400">
                            {item.quantity}주 · {item.filledPrice?.toLocaleString()}원
                          </span>
                          <span className="text-[12px] text-gray-400">{formatTime(item.createdAt)}</span>
                        </div>
                      </div>

                      {/* 우측: 내용 + 수익 */}
                      <div className="flex flex-1 items-start justify-between gap-4 min-w-0">
                        <p className="text-[14px] text-gray-700 leading-relaxed line-clamp-2 flex-1 min-w-0">
                          {item.content}
                        </p>
                        {!isBuy && (
                          <span className={`text-[15px] font-bold shrink-0 ${isPositive ? "text-[#FF4444]" : "text-[#0046FF]"}`}>
                            {isPositive ? "+" : ""}{item.profit?.toLocaleString()}원
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
