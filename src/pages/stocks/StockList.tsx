import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";

const INVEST_TOUR: TourStep[] = [
  {
    target: "invest-market",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <TrendingUp size={15} />
        코스피 · 코스닥이 뭔가요?
      </span>
    ),
    description: "국내 주식시장의 흐름을 보여주는 대표 지수예요.",
    items: [
      { label: "코스피(KOSPI):", labelColor: "#111827", text: "우리나라의 대표 주식 시장인 코스피 시장에 상장된 기업들의 주가 지수를 의미해요." },
      { label: "코스닥(KOSDAQ):", labelColor: "#111827", text: "코스닥 시장에 상장된 주식들의 가격 지수를 의미해요." },
      "코스피 시장엔 주로 대기업이, 코스닥 시장엔 중소 및 벤처 기업이 상장되어 있어요.",
      "지수가 오르면 시장 분위기가 좋은 편이라고 볼 수 있어요.",
    ],
    placement: "bottom",
  },
  {
    target: "stock-columns",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Hash size={15} />각 숫자는 무엇을 뜻하나요?
      </span>
    ),
    description: "종목 리스트에서 자주 보이는 숫자들이에요.",
    items: [
      "현재가 — 지금 이 순간 거래되는 가격",
      "등락률 — 전일 대비 가격이 얼마나 변했는지 (%)",
      "거래량 — 오늘 거래된 주식 수",
      "시가총액 — 회사의 전체 주식 가치를 나타내는 규모",
    ],
    placement: "bottom",
  },
  {
    target: "stock-search",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Search size={15} />
        원하는 종목을 찾아보세요
      </span>
    ),
    description:
      "종목명이나 코드로 검색하고,\n거래량·등락률 순으로 정렬해 비교할 수 있어요.",
    placement: "bottom",
  },
  {
    target: "stock-table",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <ClipboardList size={15} />
        종목을 클릭해보세요
      </span>
    ),
    description:
      "관심 있는 종목을 누르면\n상세 정보와 매수·매도 화면으로 이동할 수 있어요.",
    placement: "bottom",
  },
];
import {
  Search,
  TrendingUp,
  TrendingDown,
  Hash,
  ClipboardList,
  Heart,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useStockStore } from "@/store/stockStore";

import { useMarketIndicesQuery } from "@/api/homeApi";
import {
  fetchStocks,
  parseStockItemMessage,
  useWatchlistQuery,
  useAddWatchlistMutation,
  useRemoveWatchlistMutation,
} from "@/api/stockApi";
import type { MarketIndexData } from "@/api/homeApi";
import type { StockItem, StockItemMessage } from "@/api/stockApi";
import { stompSubscribe } from "@/lib/stompClient";

// ─── Constants ────────────────────────────────────────────────────────────────

function formatMarketCap(cap: number): string {
  if (cap >= 10000) {
    const cho = Math.floor(cap / 10000);
    const eok = cap % 10000;
    return eok > 0 ? `${cho}조 ${eok.toLocaleString()}억원` : `${cho}조원`;
  }
  return `${cap.toLocaleString()}억원`;
}

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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 flex divide-x divide-gray-100 dark:divide-slate-800 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 px-3 py-3 md:px-6 md:py-5 flex flex-col gap-2"
          >
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-10 md:w-16" />
            <div className="h-5 md:h-7 bg-gray-100 dark:bg-slate-700 rounded-full w-16 md:w-28" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-20 md:w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 flex divide-x divide-gray-100 dark:divide-slate-800">
      {data.map((idx) => (
        <div key={idx.label} className="flex-1 px-3 py-3 md:px-6 md:py-5">
          <p className="text-[11px] md:text-[12px] text-gray-400 dark:text-slate-500 font-medium mb-0.5 md:mb-1">
            {idx.label}
          </p>
          <p className="text-[16px] md:text-[24px] font-semibold text-gray-900 dark:text-gray-100">
            {idx.value}
          </p>
          <div className="flex items-center gap-0.5 md:gap-1 mt-0.5">
            {idx.isPositive ? (
              <TrendingUp size={11} className="text-red-500" />
            ) : (
              <TrendingDown size={11} className="text-blue-600" />
            )}
            <span
              className={`text-[10px] md:text-[12px] font-medium ${idx.isPositive ? "text-red-500" : "text-blue-600"}`}
            >
              {idx.isPositive ? "+" : ""}
              {idx.changePercent}%
            </span>
          </div>
          <p className="hidden md:block text-[12px] text-gray-400 mt-1">
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
  isWatched,
  onToggleWatchlist,
}: {
  stock: StockItem;
  onClick: () => void;
  index: number;
  isWatched: boolean;
  onToggleWatchlist: (e: React.MouseEvent) => void;
}) {
  return (
    <tr
      className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="pl-6 pr-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleWatchlist}
            className="flex-shrink-0 hover:scale-110 transition-transform"
          >
            <Heart
              size={14}
              fill={isWatched ? "#0046FF" : "transparent"}
              stroke={isWatched ? "#0046FF" : "#CBD5E1"}
              strokeWidth={1.8}
            />
          </button>
          <span className="hidden md:inline-block w-5 text-center text-[12px] text-gray-500 dark:text-slate-400 tabular-nums">
            {index}
          </span>
        </div>
      </td>
      <td className="pl-2 pr-2 md:pl-3 md:pr-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="md:hidden"><Avatar name={stock.stockName} src={stock.stockLogo} size={28} /></span>
          <span className="hidden md:inline-flex"><Avatar name={stock.stockName} src={stock.stockLogo} size={34} /></span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                {stock.stockName}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {stock.tickerCode}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell px-6 py-3.5 text-left text-[12px] text-gray-500 dark:text-slate-400 whitespace-nowrap">
        {SECTOR_MAP[stock.sectorType] ?? stock.sectorType}
      </td>
      <td className="px-6 py-3.5 text-right whitespace-nowrap">
        <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {stock.currentPrice.toLocaleString()}원
        </p>
        <p
          className={`md:hidden text-[12px] font-semibold tabular-nums ${stock.changeRate > 0 ? "text-red-500" : stock.changeRate < 0 ? "text-blue-500" : "text-gray-500"}`}
        >
          {stock.changeRate > 0 ? "+" : ""}
          {stock.changeRate.toFixed(2)}%
        </p>
      </td>
      <td className="hidden md:table-cell px-6 py-3.5 text-right whitespace-nowrap">
        <span
          className={`text-[12px] font-semibold tabular-nums ${stock.changeRate > 0 ? "text-red-500" : stock.changeRate < 0 ? "text-blue-500" : "text-gray-500"}`}
        >
          {stock.changeRate > 0 ? "+" : ""}
          {stock.changeRate.toFixed(2)}%
        </span>
      </td>
      <td className="hidden md:table-cell px-6 py-3.5 text-right text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
        {stock.volume != null ? `${stock.volume.toLocaleString()}주` : "-"}
      </td>
      <td className="hidden md:table-cell pl-6 pr-8 py-3.5 text-right text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
        {stock.total != null ? formatMarketCap(stock.total) : "-"}
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
  const [search, setSearch] = useState(""); // 검색어 상태

  const [searchParams, setSearchParams] = useSearchParams();
  const sectors = (searchParams.get("sector") ?? "").split(",").filter(Boolean);
  const sort = (searchParams.get("sort") ?? "거래량순") as SortType;
  const watchlistOnly = searchParams.get("watchlist") === "true";

  const { data: watchlistCodes = [] } = useWatchlistQuery();
  const watchlistSet = new Set(watchlistCodes);
  const addWatchlist = useAddWatchlistMutation();
  const removeWatchlist = useRemoveWatchlistMutation();

  const toggleWatchlistOnly = () =>
    setSearchParams(
      (p) => {
        if (watchlistOnly) p.delete("watchlist");
        else p.set("watchlist", "true");
        return p;
      },
      { replace: true },
    );

  const handleToggleWatchlist = (e: React.MouseEvent, tickerCode: string) => {
    e.stopPropagation();
    if (watchlistSet.has(tickerCode)) {
      removeWatchlist.mutate(tickerCode);
    } else {
      addWatchlist.mutate(tickerCode);
    }
  };

  const toggleSector = (v: string) =>
    setSearchParams(
      (p) => {
        if (v === "전체") {
          p.delete("sector");
          return p;
        }
        const cur = (p.get("sector") ?? "").split(",").filter(Boolean);
        const next = cur.includes(v) ? cur.filter((s) => s !== v) : [...cur, v];
        if (next.length === 0) p.delete("sector");
        else p.set("sector", next.join(","));
        return p;
      },
      { replace: true },
    );
  const setSort = (v: SortType) =>
    setSearchParams(
      (p) => {
        if (v === "거래량순") p.delete("sort");
        else p.set("sort", v);
        return p;
      },
      { replace: true },
    );

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
    .filter((s) => !watchlistOnly || watchlistSet.has(s.tickerCode))
    .filter(
      (s) => sectors.length === 0 || sectors.includes(SECTOR_MAP[s.sectorType]),
    )
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
    <div className="flex flex-col h-full p-3 md:p-6 gap-3 overflow-auto bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100">
          모의투자
        </h1>
        <p className="text-[12px] text-gray-400 dark:text-slate-500 mt-0.5">
          KOSPI200 종목으로 실전 같은 모의 매매를 경험하세요
        </p>
      </div>

      {/* 시장 지수 */}
      <div data-tour="invest-market">
        <MarketPanel data={marketIndices} loading={loadingMarket} />
      </div>

      {/* 검색 + 정렬 */}
      <div
        className="flex flex-col gap-5 md:flex-row items-stretch md:items-center md:gap-3"
        data-tour="stock-search"
      >
        <div className="relative flex-1 md:max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="종목명 또는 코드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[12px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#0046FF] transition-colors dark:text-gray-100 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors ${sort === s
                  ? "bg-[#0046FF] text-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 섹터 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {/* 전체 */}
        <button
          onClick={() => {
            toggleSector("전체");
            if (watchlistOnly) toggleWatchlistOnly();
          }}
          className={`px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${!watchlistOnly && sectors.length === 0
              ? "bg-[#0046FF] text-white"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600"
            }`}
        >
          전체
        </button>
        {/* 관심 */}
        <button
          onClick={toggleWatchlistOnly}
          className={`px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${watchlistOnly
              ? "bg-[#0046FF] text-white"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600"
            }`}
        >
          관심
        </button>
        {/* 섹터 */}
        {SECTORS.filter((s) => s !== "전체").map((s) => (
          <button
            key={s}
            onClick={() => toggleSector(s)}
            className={`px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${sectors.includes(s)
                ? "bg-[#0046FF] text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <SpotlightTour tourKey="invest" steps={INVEST_TOUR} />

      {/* 종목 테이블 */}
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-x-auto"
        data-tour="stock-table"
      >
        <table className="w-full md:min-w-175">
          <thead data-tour="stock-columns">
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <th className="text-left pl-6 pr-4 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 hidden md:inline-block" />
                  <span className="hidden md:inline-block w-5 text-center">순위</span>
                </div>
              </th>
              <th className="text-left pl-2 pr-2 md:pl-3 md:pr-5 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                종목명
              </th>
              <th className="hidden md:table-cell text-left px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                섹터
              </th>
              <th className="text-right px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                현재가
              </th>
              <th className="hidden md:table-cell text-right px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                등락률
              </th>
              <th className="hidden md:table-cell text-right px-6 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                거래량
              </th>
              <th className="hidden md:table-cell text-right pl-6 pr-8 py-3 text-[12px] text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                시가총액
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.length > 0 ? (
              filtered.map((stock, idx) => (
                <StockRow
                  key={stock.tickerCode}
                  stock={stock}
                  index={idx + 1}
                  isWatched={watchlistSet.has(stock.tickerCode)}
                  onToggleWatchlist={(e) =>
                    handleToggleWatchlist(e, stock.tickerCode)
                  }
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
                  {watchlistOnly
                    ? "관심 종목이 없습니다. ♡ 버튼을 눌러 추가해보세요."
                    : "검색 결과가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
