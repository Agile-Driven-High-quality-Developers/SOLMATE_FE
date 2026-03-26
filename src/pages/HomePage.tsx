import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useMarketIndicesQuery } from "@/api/homeApi";
import type { MarketIndexData } from "@/api/homeApi";
import { useHoldingsQuery } from "@/api/accountApi";
import type { HoldingItem } from "@/api/accountApi";
import { useUserListInfiniteQuery } from "@/api/userListApi";
import type { UserItem } from "@/api/userListApi";
import {
  useAccountSummaryByUserQuery,
  useAccountSummaryQuery,
} from "@/api/accountSummaryApi";
import type { AccountSummaryData } from "@/api/accountSummaryApi";
import { useStocksQuery } from "@/api/stockApi";
import type { StockItem } from "@/api/stockApi";

// ─── 날짜 ─────────────────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

// ─── Utils ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#4ECDC4",
  "#45B7D1",
  "#FF6B35",
  "#96CEB4",
  "#DDA0DD",
  "#BB8FCE",
  "#85C1E9",
  "#F0A500",
  "#E74C3C",
  "#2ECC71",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

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
    <span
      className={[
        isPositive ? "text-red-500" : "text-blue-600",
        className,
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse flex flex-col gap-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-100 rounded-full"
          style={{ width: `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

// ─── 시장 지수 카드 ────────────────────────────────────────────────────────────

function MarketIndexCard({ index }: { index: MarketIndexData }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-3">
      <p className="text-[12px] text-gray-400 font-medium mb-1">
        {index.label}
      </p>
      <p className="text-[18px] font-bold text-gray-900">{index.value}</p>
      <div className="flex items-center gap-1 mt-0.5">
        {index.isPositive ? (
          <TrendingUp size={12} className="text-red-500" />
        ) : (
          <TrendingDown size={12} className="text-blue-600" />
        )}
        <ReturnText
          value={`${index.isPositive ? "▲" : "▼"}${index.change} (${index.isPositive ? "+" : "-"}${index.changePercent}%)`}
          isPositive={index.isPositive}
          className="text-[12px] font-medium"
        />
      </div>
    </div>
  );
}

function MarketIndicesRow({
  data,
  loading,
}: {
  data: MarketIndexData[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-3 animate-pulse"
          >
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

function PortfolioCard({
  data,
  loading,
}: {
  data: AccountSummaryData | undefined;
  loading: boolean;
}) {
  const fmt = (n: number) => {
    const man = n / 10000;
    return `${man % 1 === 0 ? man.toLocaleString() : man.toFixed(1)}만원`;
  };
  const isPositive = (data?.totalReturnAmount ?? 0) >= 0;

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1437C8 0%, #0046FF 60%, #3B6FFF 100%)",
      }}
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
            <p className="text-white/70 text-[13px] font-medium mb-1">
              총 평가자산
            </p>
            <p className="text-white text-[32px] font-bold leading-tight">
              {fmt(data.totalAsset)}
            </p>
            <p
              className={`text-[14px] font-medium mt-1 ${isPositive ? "text-red-300" : "text-blue-300"}`}
            >
              {isPositive ? "+" : ""}
              {fmt(data.totalReturnAmount)} ({isPositive ? "+" : ""}
              {data.totalReturnRate.toFixed(2)}%)
            </p>
            <div className="flex gap-6 mt-5">
              <div>
                <p className="text-white/60 text-[11px]">투자원금</p>
                <p className="text-white text-[14px] font-semibold mt-0.5">
                  {fmt(data.initialCash)}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-[11px]">예수금</p>
                <p className="text-white text-[14px] font-semibold mt-0.5">
                  {fmt(data.cash)}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-[11px]">보유종목</p>
                <p className="text-white text-[14px] font-semibold mt-0.5">
                  {data.holdingsCount}개
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 보유 종목 ─────────────────────────────────────────────────────────────────

function HoldingsTable({
  data,
  loading,
}: {
  data: HoldingItem[];
  loading: boolean;
}) {
  const navigate = useNavigate();
  const top5 = data.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-[15px] font-semibold text-gray-900">보유 종목</h2>
        <button
          onClick={() => navigate("/profile", { state: { tab: "portfolio" } })}
          className="flex items-center gap-0.5 text-[13px] text-[#0046FF] hover:opacity-70 transition-opacity"
        >
          전체 <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <SectionSkeleton rows={5} />
      ) : top5.length === 0 ? (
        <p className="text-[13px] text-gray-400 text-center py-8">
          보유 종목이 없습니다.
        </p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-2.5 text-[12px] text-gray-400 font-medium">
                종목
              </th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 font-medium">
                보유량
              </th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 font-medium">
                평가금액
              </th>
              <th className="text-right px-4 py-2.5 text-[12px] text-gray-400 font-medium">
                평가손익
              </th>
              <th className="text-right px-5 py-2.5 text-[12px] text-gray-400 font-medium">
                수익률
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {top5.map((stock) => {
              const isPositive = stock.returnRate >= 0;
              return (
                <tr
                  key={stock.tickerCode}
                  onClick={() => navigate(`/invest/${stock.tickerCode}`)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={stock.stockName}
                        src={stock.stockLogo || undefined}
                        size={28}
                        color={getAvatarColor(stock.stockName)}
                      />
                      <div>
                        <span className="text-[14px] font-medium text-gray-900">
                          {stock.stockName}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          {stock.tickerCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[14px] text-gray-600">
                    {stock.quantity}주
                  </td>
                  <td className="px-4 py-3 text-right text-[14px] text-gray-800 font-medium">
                    {stock.evaluation.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ReturnText
                      value={`${isPositive ? "+" : ""}${stock.returnAmount.toLocaleString()}원`}
                      isPositive={isPositive}
                      className="text-[14px] font-medium"
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ReturnText
                      value={`${isPositive ? "+" : ""}${stock.returnRate.toFixed(2)}%`}
                      isPositive={isPositive}
                      className="text-[14px] font-semibold"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── TOP 투자자 ────────────────────────────────────────────────────────────────

function InvestorReturnRate({ userId, me }: { userId: number; me: boolean }) {
  const myQuery = useAccountSummaryQuery();
  const otherQuery = useAccountSummaryByUserQuery(userId);
  const { data, isLoading } = me ? myQuery : otherQuery;

  if (isLoading)
    return <div className="h-3 bg-gray-100 rounded-full w-12 animate-pulse" />;

  const rate = data?.totalReturnRate ?? 0;
  const isPositive = rate > 0;
  const isNegative = rate < 0;
  const color = isPositive
    ? "text-red-500"
    : isNegative
      ? "text-blue-500"
      : "text-gray-400";
  const prefix = isPositive ? "+" : "";

  return (
    <span className={`text-[14px] font-semibold ${color}`}>
      {prefix}
      {rate.toFixed(1)}%
    </span>
  );
}

function TopInvestors({
  data,
  loading,
}: {
  data: UserItem[];
  loading: boolean;
}) {
  const navigate = useNavigate();
  const top5 = data.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-[15px] font-semibold text-gray-900">TOP 투자자</h2>
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-0.5 text-[13px] text-[#0046FF] hover:opacity-70 transition-opacity"
        >
          전체 <ChevronRight size={14} />
        </button>
      </div>
      {loading ? (
        <SectionSkeleton rows={5} />
      ) : (
        <ul className="divide-y divide-gray-50">
          {top5.map((investor, i) => (
            <li
              key={investor.userId}
              onClick={() =>
                navigate(investor.me ? "/profile" : `/users/${investor.userId}`)
              }
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
            >
              <span
                className={`w-5 text-[13px] font-bold ${i < 3 ? "text-[#0046FF]" : "text-gray-400"}`}
              >
                {i + 1}
              </span>
              <Avatar
                name={investor.nickname}
                src={investor.imageUrl || undefined}
                size={30}
                color={getAvatarColor(investor.nickname)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-800 truncate">
                  {investor.nickname}
                </p>
                <p className="text-[11px] text-gray-400">
                  {investor.followerCount.toLocaleString()}명 팔로워
                </p>
              </div>
              <InvestorReturnRate userId={investor.userId} me={investor.me} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── 인기 종목 ─────────────────────────────────────────────────────────────────

function PopularStocks({
  data,
  loading,
}: {
  data: StockItem[];
  loading: boolean;
}) {
  const navigate = useNavigate();
  const top5 = [...data].sort((a, b) => b.volume - a.volume).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-[15px] font-semibold text-gray-900">인기 종목</h2>
        <button
          onClick={() => navigate("/invest")}
          className="flex items-center gap-0.5 text-[13px] text-[#0046FF] hover:opacity-70 transition-opacity"
        >
          전체 <ChevronRight size={14} />
        </button>
      </div>
      {loading ? (
        <SectionSkeleton rows={5} />
      ) : (
        <ul className="divide-y divide-gray-50">
          {top5.map((stock, i) => {
            const isPositive = stock.changeRate > 0;
            const isNegative = stock.changeRate < 0;
            return (
              <li
                key={stock.tickerCode}
                onClick={() => navigate(`/invest/${stock.tickerCode}`)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <span
                  className={`w-5 text-[13px] font-bold ${i < 3 ? "text-[#0046FF]" : "text-gray-400"}`}
                >
                  {i + 1}
                </span>
                <Avatar
                  name={stock.stockName}
                  src={stock.stockLogo || undefined}
                  size={30}
                  color={getAvatarColor(stock.stockName)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-gray-800 truncate">
                    {stock.stockName}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {stock.tickerCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-gray-900">
                    {stock.currentPrice.toLocaleString()}원
                  </p>
                  <p
                    className={`text-[12px] font-medium ${isPositive ? "text-red-500" : isNegative ? "text-blue-500" : "text-gray-400"}`}
                  >
                    {isPositive ? "+" : ""}
                    {stock.changeRate.toFixed(2)}%
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: marketIndices = [], isLoading: loadingMarket } =
    useMarketIndicesQuery();
  const { data: summary, isLoading: loadingSummary } = useAccountSummaryQuery();
  const { data: holdings = [], isLoading: loadingHoldings } =
    useHoldingsQuery();
  const { data: userListData, isLoading: loadingUsers } =
    useUserListInfiniteQuery();
  const { data: stocks = [], isLoading: loadingStocks } = useStocksQuery();

  const allUsers = userListData?.pages.flatMap((p) => p.users) ?? [];

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
      <div data-tour="market-indices">
        <MarketIndicesRow data={marketIndices} loading={loadingMarket} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex gap-5 items-start">
        {/* 왼쪽: 포트폴리오 + 보유 종목 */}
        <div className="flex flex-col gap-4" style={{ flex: "0 0 58%" }}>
          <div data-tour="portfolio">
            <PortfolioCard data={portfolio} loading={false} />
          </div>
          <div data-tour="holdings">
            <HoldingsTable data={holdings} loading={false} />
          </div>
          <PortfolioCard data={summary} loading={loadingSummary} />
          <HoldingsTable data={holdings} loading={loadingHoldings} />
        </div>

        {/* 오른쪽: TOP 투자자 + 인기 종목 */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <TopInvestors data={allUsers} loading={loadingUsers} />
          <PopularStocks data={stocks} loading={loadingStocks} />
        </div>
      </div>
    </div>
  );
}
