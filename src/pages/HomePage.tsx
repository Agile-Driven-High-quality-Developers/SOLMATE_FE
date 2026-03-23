import { useEffect, useState } from "react";
import { Bell, ChevronRight, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
// import { homeApi } from "@/api/homeApi";
import type {
  MarketIndexData,
  PortfolioData,
  HoldingStockData,
  TopInvestorData,
  PopularStockData,
} from "@/api/homeApi";

// ─── 날짜 ─────────────────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

// ─── 공통 서브 컴포넌트 ────────────────────────────────────────────────────────

function ReturnText({
  value,
  isPositive,
  className = "",
}: {
  value: string;
  isPositive: boolean;
  className?: string;
}) {
  return (
    <span className={[isPositive ? "text-red-500" : "text-blue-600", className].join(" ")}>
      {value}
    </span>
  );
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse flex flex-col gap-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded-full" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

// ─── 시장 지수 카드 ────────────────────────────────────────────────────────────

function MarketIndexCard({ index }: { index: MarketIndexData }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-3">
      <p className="text-[12px] text-gray-400 font-medium mb-1">{index.label}</p>
      <p className="text-[18px] font-bold text-gray-900">{index.value}</p>
      <div className="flex items-center gap-1 mt-0.5">
        {index.isPositive
          ? <TrendingUp size={12} className="text-red-500" />
          : <TrendingDown size={12} className="text-blue-600" />}
        <ReturnText
          value={`${index.isPositive ? "▲" : "▼"}${index.change} (${index.isPositive ? "+" : "-"}${index.changePercent}%)`}
          isPositive={index.isPositive}
          className="text-[12px] font-medium"
        />
      </div>
    </div>
  );
}

function MarketIndicesRow({ data, loading }: { data: MarketIndexData[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-3 animate-pulse">
            <div className="h-3 bg-gray-100 rounded-full w-16 mb-2" />
            <div className="h-5 bg-gray-100 rounded-full w-24 mb-2" />
            <div className="h-3 bg-gray-100 rounded-full w-28" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      {data.map((idx) => (
        <MarketIndexCard key={idx.label} index={idx} />
      ))}
    </div>
  );
}

// ─── 포트폴리오 카드 ───────────────────────────────────────────────────────────

function PortfolioCard({ data, loading }: { data: PortfolioData | null; loading: boolean }) {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1437C8 0%, #0046FF 60%, #3B6FFF 100%)" }}
    >
      {/* 장식 원 */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
        <div className="w-28 h-28 rounded-full border-[16px] border-white" />
      </div>
      <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-10">
        <div className="w-40 h-40 rounded-full border-[20px] border-white" />
      </div>

      <div className="relative z-10">
        {loading || !data ? (
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-3 bg-white/20 rounded-full w-20" />
            <div className="h-8 bg-white/20 rounded-full w-36" />
            <div className="h-3 bg-white/20 rounded-full w-28" />
            <div className="flex gap-6 mt-2">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-2 bg-white/20 rounded-full w-12 mb-1" />
                  <div className="h-4 bg-white/20 rounded-full w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="text-white/70 text-[13px] font-medium mb-1">총 평가금산</p>
            <p className="text-white text-[32px] font-bold leading-tight">{data.totalValue}</p>
            <p className="text-white/90 text-[14px] font-medium mt-1">
              {data.totalReturn} ({data.totalReturnPercent})
            </p>
            <div className="flex gap-6 mt-5">
              <div>
                <p className="text-white/60 text-[11px]">투자원금</p>
                <p className="text-white text-[14px] font-semibold mt-0.5">{data.principal}</p>
              </div>
              <div>
                <p className="text-white/60 text-[11px]">매수금</p>
                <p className="text-white text-[14px] font-semibold mt-0.5">{data.purchaseAmount}</p>
              </div>
              <div>
                <p className="text-white/60 text-[11px]">보유종목</p>
                <p className="text-white text-[14px] font-semibold mt-0.5">{data.holdingCount}개</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 보유 종목 ─────────────────────────────────────────────────────────────────

function HoldingsTable({ data, loading }: { data: HoldingStockData[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-[15px] font-semibold text-gray-900">보유 종목</h2>
        <button className="flex items-center gap-0.5 text-[13px] text-[#0046FF] hover:opacity-70 transition-opacity">
          전체 <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <SectionSkeleton rows={5} />
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-2.5 text-[12px] text-gray-400 font-medium">종목</th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 font-medium">보유량</th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 font-medium">평가금액</th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 font-medium">평가손익</th>
              <th className="text-right px-5 py-2.5 text-[12px] text-gray-400 font-medium">수익률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((stock) => (
              <tr key={stock.name} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={stock.name} color={stock.color} size={28} />
                    <span className="text-[14px] font-medium text-gray-900">{stock.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[14px] text-gray-600">{stock.quantity}주</td>
                <td className="px-4 py-3 text-right text-[14px] text-gray-800 font-medium">{stock.evalAmount}</td>
                <td className="px-4 py-3 text-right">
                  <ReturnText value={stock.evalProfit} isPositive={stock.isPositive} className="text-[14px] font-medium" />
                </td>
                <td className="px-5 py-3 text-right">
                  <ReturnText value={stock.returnRate} isPositive={stock.isPositive} className="text-[14px] font-semibold" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── TOP 투자자 ────────────────────────────────────────────────────────────────

function TopInvestors({ data, loading }: { data: TopInvestorData[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-[15px] font-semibold text-gray-900">TOP 투자자</h2>
        <button className="flex items-center gap-0.5 text-[13px] text-[#0046FF] hover:opacity-70 transition-opacity">
          전체 <ChevronRight size={14} />
        </button>
      </div>
      {loading ? (
        <SectionSkeleton rows={5} />
      ) : (
        <ul className="divide-y divide-gray-50">
          {data.map((investor) => (
            <li key={investor.rank} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
              <span className="w-5 text-[13px] font-bold text-gray-400">{investor.rank}</span>
              <Avatar name={investor.name} color={investor.color} size={30} />
              <span className="flex-1 text-[14px] font-medium text-gray-800 truncate">{investor.name}</span>
              <ReturnText value={investor.returnRate} isPositive={true} className="text-[14px] font-semibold" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── 인기 종목 ─────────────────────────────────────────────────────────────────

function PopularStocks({ data, loading }: { data: PopularStockData[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-[15px] font-semibold text-gray-900">인기 종목</h2>
        <button className="flex items-center gap-0.5 text-[13px] text-[#0046FF] hover:opacity-70 transition-opacity">
          전체 <ChevronRight size={14} />
        </button>
      </div>
      {loading ? (
        <SectionSkeleton rows={8} />
      ) : (
        <ul className="divide-y divide-gray-50">
          {data.map((stock) => (
            <li key={stock.rank} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
              <span className="w-5 text-[13px] font-bold text-gray-400">{stock.rank}</span>
              <Avatar name={stock.name} color={stock.color} size={30} />
              <span className="flex-1 text-[14px] font-medium text-gray-800 truncate">{stock.name}</span>
              <div className="text-right">
                <p className="text-[14px] font-semibold text-gray-900">{stock.price}</p>
                <ReturnText value={stock.changePercent} isPositive={stock.isPositive} className="text-[12px] font-medium" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [marketIndices, setMarketIndices] = useState<MarketIndexData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [holdings, setHoldings] = useState<HoldingStockData[]>([]);
  const [topInvestors, setTopInvestors] = useState<TopInvestorData[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStockData[]>([]);

  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const [loadingInvestors, setLoadingInvestors] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    // TODO: 백엔드 API 구현 후 주석 해제
    // homeApi.getMarketIndices()
    //   .then((res) => setMarketIndices(res.data.data))
    //   .finally(() => setLoadingMarket(false));
    setLoadingMarket(false);

    // homeApi.getPortfolio()
    //   .then((res) => setPortfolio(res.data.data))
    //   .finally(() => setLoadingPortfolio(false));
    setLoadingPortfolio(false);

    // homeApi.getHoldings()
    //   .then((res) => setHoldings(res.data.data))
    //   .finally(() => setLoadingHoldings(false));
    setLoadingHoldings(false);

    // homeApi.getTopInvestors()
    //   .then((res) => setTopInvestors(res.data.data))
    //   .finally(() => setLoadingInvestors(false));
    setLoadingInvestors(false);

    // homeApi.getPopularStocks()
    //   .then((res) => setPopularStocks(res.data.data))
    //   .finally(() => setLoadingPopular(false));
    setLoadingPopular(false);
  }, []);

  const isInitialLoading =
    loadingMarket && loadingPortfolio && loadingHoldings && loadingInvestors && loadingPopular;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#0046FF]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">홈</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{TODAY}</p>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-500" />
        </button>
      </div>

      {/* 시장 지수 */}
      <MarketIndicesRow data={marketIndices} loading={loadingMarket} />

      {/* 메인 콘텐츠 */}
      <div className="flex gap-5 items-start">
        {/* 왼쪽: 포트폴리오 + 보유 종목 */}
        <div className="flex flex-col gap-4" style={{ flex: "0 0 58%" }}>
          <PortfolioCard data={portfolio} loading={loadingPortfolio} />
          <HoldingsTable data={holdings} loading={loadingHoldings} />
        </div>

        {/* 오른쪽: TOP 투자자 + 인기 종목 */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <TopInvestors data={topInvestors} loading={loadingInvestors} />
          <PopularStocks data={popularStocks} loading={loadingPopular} />
        </div>
      </div>
    </div>
  );
}
