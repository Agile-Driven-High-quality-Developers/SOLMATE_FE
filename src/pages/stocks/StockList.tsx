import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const INVEST_TOUR: TourStep[] = [
  {
    target: "invest-market",
    title: "📈 코스피 · 코스닥이 뭔가요?",
    description: "주식 시장 전체의 흐름을 숫자 하나로 나타낸 지수예요.",
    items: [
      "코스피(KOSPI) — 삼성·현대 같은 대형 우량 기업 지수",
      "코스닥(KOSDAQ) — 네이버·카카오 같은 중소·기술 기업 지수",
      "지수가 오르면 시장 전체 분위기가 좋은 날이에요!",
    ],
    placement: "bottom",
  },
  {
    target: "stock-columns",
    title: "🔢 각 숫자가 무슨 뜻이에요?",
    description: "종목 리스트에서 보이는 숫자들이에요.",
    items: [
      "현재가 — 지금 이 순간 거래되는 가격",
      "등락률 — 어제보다 얼마나 올랐는지 (%)",
      "거래량 — 오늘 사고판 주식 수",
      "시가총액 — 회사 주식을 전부 사면 드는 돈 (회사 규모)",
    ],
    placement: "bottom",
  },
  {
    target: "stock-search",
    title: "🔍 원하는 종목 찾기",
    description:
      "회사 이름으로 검색하거나 거래량·등락률 순으로 정렬해서 마음에 드는 종목을 찾아봐요.",
    placement: "bottom",
  },
  {
    target: "stock-table",
    title: "📋 종목을 클릭해봐요!",
    description:
      "현재가·등락률이 실시간으로 바뀌어요. 종목을 클릭하면 차트 보기와 매수·매도 화면으로 이동해요!",
    placement: "bottom",
  },
];
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useStockStore } from "@/store/stockStore";

import { useMarketIndicesQuery } from "@/api/homeApi";
import { fetchStocks, parseStockItemMessage } from "@/api/stockApi";
import type { MarketIndexData } from "@/api/homeApi";
import type { StockItem, StockItemMessage } from "@/api/stockApi";
import { stompSubscribe } from "@/lib/stompClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTOR_MAP: Record<string, string> = {
  CONSTRUCTION: "건설",
  CONSUMER_DISCRETIONARY: "경기소비재",
  CONSUMER_STAPLES: "필수소비재",
  FINANCIALS: "금융",
  INDUSTRIALS: "산업재",
  ENERGY_CHEMICALS: "화학",
  INFORMATION_TECHNOLOGY: "반도체",
  HEAVY_INDUSTRIES: "중공업",
  STEEL_MATERIALS: "철강",
  COMMUNICATION_SERVICES: "통신",
  HEALTHCARE: "바이오",
};

const SECTORS = ["전체", ...new Set(Object.values(SECTOR_MAP))];

const SORTS = ["거래량순", "상승순", "하락순", "고가순"] as const;
type SortType = (typeof SORTS)[number];

// ─── 시장 지수 패널 ────────────────────────────────────────────────────────────

function MarketPanel({
  data,
  loading,
}: {
  data: MarketIndexData[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 flex divide-x divide-gray-100 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 px-6 py-5 flex flex-col gap-2">
            <div className="h-3 bg-gray-100 rounded-full w-16" />
            <div className="h-7 bg-gray-100 rounded-full w-28" />
            <div className="h-3 bg-gray-100 rounded-full w-32" />
            <div className="h-3 bg-gray-100 rounded-full w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex divide-x divide-gray-100">
      {data.map((idx) => (
        <div key={idx.label} className="flex-1 px-6 py-5">
          <p className="text-[13px] text-gray-400 font-medium mb-1">
            {idx.label}
          </p>
          <p className="text-[24px] font-bold text-gray-900">{idx.value}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {idx.isPositive ? (
              <TrendingUp size={12} className="text-red-500" />
            ) : (
              <TrendingDown size={12} className="text-blue-600" />
            )}
            <span
              className={`text-[12px] font-medium ${idx.isPositive ? "text-red-500" : "text-blue-600"}`}
            >
              {idx.isPositive ? "▲" : "▼"}
              {idx.change} ({idx.isPositive ? "+" : "-"}
              {idx.changePercent}%)
            </span>
          </div>
          <p className="text-[12px] text-gray-400 mt-1">
            고 {idx.high} · 저 {idx.low}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── 종목 행 ──────────────────────────────────────────────────────────────────

function StockRow({
  stock,
  onClick,
  index,
}: {
  stock: StockItem;
  onClick: () => void;
  index: number;
}) {
  return (
    <tr
      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="px-4 py-3.5 text-center text-[13px] text-gray-500 tabular-nums whitespace-nowrap">
        {index}
      </td>
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar name={stock.stockName} src={stock.stockLogo} size={34} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-gray-900">
                {stock.stockName}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {stock.tickerCode}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-center text-[13px] text-gray-500 whitespace-nowrap">
        {SECTOR_MAP[stock.sectorType] ?? stock.sectorType}
      </td>
      <td className="px-4 py-3.5 text-center text-[14px] font-semibold text-gray-900 tabular-nums whitespace-nowrap">
        {stock.currentPrice.toLocaleString()}
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap">
        <span
          className={`text-[13px] font-semibold tabular-nums ${stock.changeRate > 0 ? "text-red-500" : stock.changeRate < 0 ? "text-blue-500" : "text-gray-500"}`}
        >
          {stock.changeRate > 0 ? "+" : ""}
          {stock.changeRate.toFixed(2)}%
        </span>
      </td>
      <td className="px-4 py-3.5 text-center text-[14px] font-semibold text-gray-900 tabular-nums whitespace-nowrap">
        {stock.volume?.toLocaleString() ?? "-"}
      </td>
      <td className="px-4 py-3.5 text-center text-[14px] font-semibold text-gray-900 tabular-nums whitespace-nowrap">
        {stock.total?.toLocaleString() ?? "-"}
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StockList() {
  const navigate = useNavigate();
  const setSelectedStock = useStockStore((s) => s.setSelectedStock);
  const { data: marketIndices = [], isLoading: loadingMarket } =
    useMarketIndicesQuery();

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("전체");
  const [sort, setSort] = useState<SortType>("거래량순");

  // ── 초기 fetch 후 STOMP 구독 (공유 클라이언트 재사용) ────────────────────
  useEffect(() => {
    let cancelled = false;
    const cleanupFns: Array<() => void> = [];

    fetchStocks().then((initialStocks) => {
      if (cancelled) return;
      setStocks(initialStocks);

      initialStocks.forEach(({ tickerCode }) => {
        const cleanup = stompSubscribe(
          `/topic/stocks/${tickerCode}/quote`,
          (message) => {
            const msg: StockItemMessage = JSON.parse(message.body);
            const updated = parseStockItemMessage(msg);
            setStocks((prev) =>
              prev.map((item) =>
                item.tickerCode === updated.tickerCode
                  ? { ...item, ...updated }
                  : item,
              ),
            );
          },
        );
        cleanupFns.push(cleanup);
      });
    });

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  const filtered = stocks
    .filter((s) => sector === "전체" || SECTOR_MAP[s.sectorType] === sector)
    .filter(
      (s) =>
        s.stockName.toLowerCase().includes(search.toLowerCase()) ||
        s.tickerCode.includes(search),
    )
    .slice()
    .sort((a, b) => {
      if (sort === "상승순") return b.changeRate - a.changeRate;
      if (sort === "하락순") return a.changeRate - b.changeRate;
      if (sort === "고가순") return b.currentPrice - a.currentPrice;
      return b.volume - a.volume; // 거래량순: 서버 기본 순서 유지
    });

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">모의투자</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          KOSPI200 종목으로 실전 같은 모의 매매를 경험하세요
        </p>
      </div>

      {/* 시장 지수 */}
      <div data-tour="invest-market">
        <MarketPanel data={marketIndices} loading={loadingMarket} />
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex items-center gap-3" data-tour="stock-search">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="종목명 또는 코드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0046FF] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                sort === s
                  ? "bg-[#0046FF] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 섹터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
              sector === s
                ? "bg-[#0046FF] text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <SpotlightTour tourKey="invest" steps={INVEST_TOUR} />

      {/* 종목 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto" data-tour="stock-table">
        <table className="w-full min-w-175">
          <thead data-tour="stock-columns">
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-center px-5 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                순위
              </th>
              <th className="text-left px-5 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                종목명
              </th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                섹터
              </th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                현재가
              </th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                등락률
              </th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                거래량
              </th>
              <th className="text-center px-4 py-3 text-[12px] text-gray-400 font-medium whitespace-nowrap">
                시가총액
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((stock, idx) => (
                <StockRow
                  key={stock.tickerCode}
                  stock={stock}
                  index={idx + 1}
                  onClick={() => {
                    setSelectedStock(stock);
                    navigate(`/invest/${stock.tickerCode}`);
                  }}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-[14px] text-gray-400"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
