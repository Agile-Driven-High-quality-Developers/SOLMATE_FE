import { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useMarketIndicesQuery } from "@/api/homeApi";
import type { MarketIndexData } from "@/api/homeApi";
import type { StockItem } from "@/api/stockApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORS = [
  "전체", "반도체", "2차전지", "바이오", "자동차",
  "IT", "금융", "철강", "화학", "통신", "가변", "건설",
];

const SORTS = ["거래량순", "상승순", "하락순", "고가순"] as const;
type SortType = (typeof SORTS)[number];

// ─── Mock 데이터 (백엔드 API 완성 후 교체) ──────────────────────────────────

const MOCK_STOCKS: StockItem[] = [
  { code: "005930", name: "삼성전자",   sector: "반도체",  price: "73,400원",  change: "+900",   changeRate: "+1.24%", isPositive: true,  volume: "1284만", marketCap: "4382000억원", isHolding: true,  color: "#F59E0B" },
  { code: "000660", name: "SK하이닉스", sector: "반도체",  price: "192,500원", change: "+4,500", changeRate: "+2.39%", isPositive: true,  volume: "324만",  marketCap: "139800억원",  isHolding: false, color: "#10B981" },
  { code: "035720", name: "카카오",     sector: "IT",      price: "44,850원",  change: "-550",   changeRate: "-1.21%", isPositive: false, volume: "234만",  marketCap: "19500억원",   isHolding: false, color: "#F59E0B" },
  { code: "247540", name: "에코프로비엠", sector: "2차전지", price: "148,500원", change: "-4,900", changeRate: "-3.19%", isPositive: false, volume: "123만",  marketCap: "13200억원",   isHolding: false, color: "#6366F1" },
  { code: "068270", name: "셀트리온",   sector: "바이오",  price: "178,500원", change: "+4,000", changeRate: "+2.28%", isPositive: true,  volume: "98만",   marketCap: "24300억원",   isHolding: false, color: "#8B5CF6" },
  { code: "000270", name: "기아",       sector: "자동차",  price: "108,500원", change: "+2,200", changeRate: "+2.07%", isPositive: true,  volume: "124만",  marketCap: "43800억원",   isHolding: false, color: "#F97316" },
  { code: "005380", name: "현대차",     sector: "자동차",  price: "241,500원", change: "+4,000", changeRate: "+1.68%", isPositive: true,  volume: "84만",   marketCap: "51500억원",   isHolding: false, color: "#3B82F6" },
  { code: "105560", name: "KB금융",     sector: "금융",    price: "87,200원",  change: "+800",   changeRate: "+0.92%", isPositive: true,  volume: "72만",   marketCap: "34800억원",   isHolding: false, color: "#14B8A6" },
  { code: "035420", name: "NAVER",      sector: "IT",      price: "192,000원", change: "+1,500", changeRate: "+0.79%", isPositive: true,  volume: "67만",   marketCap: "31500억원",   isHolding: false, color: "#22C55E" },
];

// ─── 시장 지수 패널 ────────────────────────────────────────────────────────────

function MarketPanel({ data, loading }: { data: MarketIndexData[]; loading: boolean }) {
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
          <p className="text-[13px] text-gray-400 font-medium mb-1">{idx.label}</p>
          <p className="text-[24px] font-bold text-gray-900">{idx.value}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {idx.isPositive
              ? <TrendingUp size={12} className="text-red-500" />
              : <TrendingDown size={12} className="text-blue-600" />}
            <span className={`text-[12px] font-medium ${idx.isPositive ? "text-red-500" : "text-blue-600"}`}>
              {idx.isPositive ? "▲" : "▼"}{idx.change} ({idx.isPositive ? "+" : "-"}{idx.changePercent}%)
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
          <Avatar name={stock.name} color={stock.color} size={34} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-gray-900">{stock.name}</span>
              {stock.isHolding && (
                <span className="text-[10px] font-medium text-[#0046FF] bg-blue-50 px-1.5 py-0.5 rounded">
                  보유
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{stock.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-[13px] text-gray-500">{stock.sector}</td>
      <td className="px-4 py-3.5 text-right text-[14px] font-semibold text-gray-900">{stock.price}</td>
      <td className="px-4 py-3.5 text-right">
        <span className={`text-[13px] font-semibold ${stock.isPositive ? "text-red-500" : "text-blue-600"}`}>
          {stock.changeRate}
        </span>
        <br />
        <span className={`text-[11px] ${stock.isPositive ? "text-red-400" : "text-blue-400"}`}>
          {stock.change}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right text-[13px] text-gray-600">{stock.volume}</td>
      <td className="px-4 py-3.5 text-right text-[13px] text-gray-600">{stock.marketCap}</td>
      <td className="px-5 py-3.5 text-right">
        <button className="bg-[#0046FF] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
          거래 &gt;
        </button>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StockList() {
  const { data: marketIndices = [], isLoading: loadingMarket } = useMarketIndicesQuery();
  const [stocks] = useState<StockItem[]>(MOCK_STOCKS);
  // TODO: 백엔드 API 완성 후 교체
  // const { data: stocks = [] } = useStocksQuery();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("전체");
  const [sort, setSort] = useState<SortType>("거래량순");

  const filtered = stocks
    .filter((s) => sector === "전체" || s.sector === sector)
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.includes(search)
    );

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
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              <th className="text-left px-5 py-3 text-[12px] text-gray-400 font-medium">종목명</th>
              <th className="text-left px-4 py-3 text-[12px] text-gray-400 font-medium">섹터</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">현재가</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">등락률</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">거래량</th>
              <th className="text-right px-4 py-3 text-[12px] text-gray-400 font-medium">시가총액</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((stock) => <StockRow key={stock.code} stock={stock} />)
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[14px] text-gray-400">
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
