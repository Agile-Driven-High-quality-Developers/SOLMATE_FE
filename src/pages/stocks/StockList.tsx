import { useEffect, useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

import {
  useMarketIndicesQuery,
  parseMarketIndicatorMessage,
  homeQueryKeys,
} from "@/api/homeApi";
import {
  useStocksQuery,
  stockQueryKeys,
  parseStockItemMessage,
} from "@/api/stockApi";
import type { MarketIndexData, MarketIndicatorMessage } from "@/api/homeApi";
import type { StockItem, StockItemMessage } from "@/api/stockApi";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTOR_MAP: Record<string, string> = {
  INFORMATION_TECHNOLOGY: "반도체",
  SECONDARY_BATTERY: "2차전지",
  HEALTHCARE: "바이오",
  AUTOMOBILE: "자동차",
  IT: "IT",
  FINANCIALS: "금융",
  STEEL_MATERIALS: "철강",
  ENERGY_CHEMICALS: "화학",
  TELECOM: "통신",
  UTILITIES: "가변",
  CONSTRUCTION: "건설",
  CONSUMER_STAPLES: "소비재",
  INDUSTRIALS: "산업재",
  HEAVY_INDUSTRIES: "중공업",
  COMMUNICATION_SERVICES: "통신",
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

function StockRow({ stock }: { stock: StockItem }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5">
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
      <td className="px-4 py-3.5 text-[13px] text-gray-500">
        {SECTOR_MAP[stock.sectorType] ?? stock.sectorType}
      </td>
      <td className="px-4 py-3.5 text-right text-[14px] font-semibold text-gray-900">
        {stock.currentPrice.toLocaleString()}
      </td>
      <td className="px-4 py-3.5 text-right">
        <span
          className={`text-[13px] font-semibold ${stock.changeRate > 0 ? "text-red-500" : stock.changeRate < 0 ? "text-blue-500" : "text-gray-500"}`}
        >
          {stock.changeRate}
        </span>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StockList() {
  const queryClient = useQueryClient();
  const { data: marketIndices = [], isLoading: loadingMarket } =
    useMarketIndicesQuery();
  const { data: stocks = [] } = useStocksQuery();

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("전체");
  const [sort, setSort] = useState<SortType>("거래량순");

  // ── STOMP 실시간 업데이트 → React Query 캐시 갱신 ───────────────────────
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_BASE_URL ?? "") + "/ws";
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        console.log("[STOMP] 연결됨");
        client.subscribe("/topic/market/indicators", (message) => {
          const msg: MarketIndicatorMessage = JSON.parse(message.body);
          console.log("[STOMP] 지수 메시지 수신:", msg.data);
          const updated = parseMarketIndicatorMessage(msg);
          queryClient.setQueryData<MarketIndexData[]>(
            homeQueryKeys.marketIndices,
            (prev = []) =>
              prev.map((item) =>
                item.label === updated.label ? updated : item,
              ),
          );
        });

        stocks.forEach(({ tickerCode }) => {
          client.subscribe(`/topic/stocks/${tickerCode}/quote`, (message) => {
            const msg: StockItemMessage = JSON.parse(message.body);
            console.log("[STOMP] 종목리스트 메시지 수신:", msg.data);
            const updated = parseStockItemMessage(msg);
            queryClient.setQueryData<StockItem[]>(
              stockQueryKeys.stocks,
              (prev = []) =>
                prev.map((item) =>
                  item.tickerCode === updated.tickerCode ? updated : item,
                ),
            );
          });
        });
      },
      onDisconnect: () => console.log("[STOMP] 연결 끊김"),
      onStompError: (frame) => console.error("[STOMP] 에러:", frame),
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [queryClient, stocks]);

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
      return 0; // 거래량순: 서버 기본 순서 유지
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
      <MarketPanel data={marketIndices} loading={loadingMarket} />

      {/* 검색 + 정렬 */}
      <div className="flex items-center gap-3">
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

      {/* 종목 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[12px] text-gray-400 font-medium">
                종목명
              </th>
              <th className="text-left px-4 py-3 text-[12px] text-gray-400 font-medium">
                섹터
              </th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">
                현재가
              </th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">
                등락률
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((stock) => (
                <StockRow key={stock.tickerCode} stock={stock} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
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
