import type { StockQuote } from "@/api/stockApi";

function formatVolume(vol: number): string {
  return `${vol.toLocaleString()}주`;
}

function formatMarketCap(cap: number): string {
  if (cap >= 10000) {
    const cho = Math.floor(cap / 10000);
    const eok = cap % 10000;
    return eok > 0 ? `${cho}조 ${eok.toLocaleString()}억원` : `${cho}조원`;
  }
  return `${cap.toLocaleString()}억원`;
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
          <div key={label} className="bg-white dark:bg-slate-900 px-2 py-3 md:px-4">
            <p className="text-[10px] md:text-[12px] text-gray-400 dark:text-slate-500 mb-1 whitespace-nowrap">
              {label}
            </p>
            <p
              className={`text-[11px] md:text-[15px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis break-keep ${color || "text-gray-900 dark:text-gray-100"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
