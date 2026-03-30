import type { StockQuote } from "@/api/stockApi";

function formatVolume(vol: number): string {
  if (vol >= 100_000_000) return `${(vol / 100_000_000).toFixed(1)}억`;
  if (vol >= 10_000) return `${Math.round(vol / 10_000).toLocaleString()}만`;
  return vol.toLocaleString();
}

function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000)
    return `${(cap / 1_000_000_000_000).toFixed(1)}조원`;
  if (cap >= 100_000_000) return `${(cap / 100_000_000).toFixed(1)}억원`;
  return `${cap.toLocaleString()}원`;
}

interface Props {
  quote: StockQuote;
}

export default function StockInfoGrid({ quote }: Props) {
  const cells = [
    {
      label: "시가",
      value: `${quote.openPrice.toLocaleString()}원`,
      color: "",
    },
    {
      label: "고가",
      value: `${quote.highPrice.toLocaleString()}원`,
      color: "text-red-500",
    },
    {
      label: "저가",
      value: `${quote.lowPrice.toLocaleString()}원`,
      color: "text-blue-500",
    },
    {
      label: "전일종가",
      value: `${quote.previousClosePrice.toLocaleString()}원`,
      color: "",
    },
    { label: "거래량", value: formatVolume(quote.volume), color: "" },
    { label: "시가총액", value: formatMarketCap(quote.total), color: "" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-4">
        종목 정보
      </h3>
      <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden">
        {cells.map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 px-4 py-3">
            <p className="text-[12px] text-gray-400 dark:text-slate-500 mb-1">
              {label}
            </p>
            <p
              className={`text-[15px] font-semibold ${color || "text-gray-900 dark:text-gray-100"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
