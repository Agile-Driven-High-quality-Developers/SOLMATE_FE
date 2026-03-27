import { useRef, useEffect, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { useCandleQuery } from "@/api/stockApi";

const KST_OFFSET = 9 * 3600;

function toDateString(epochSec: number): string {
  const adjusted = epochSec + KST_OFFSET;
  const d = new Date(adjusted * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "2026-03-27" → { year: 2026, month: 3, day: 27 }
function toBusinessDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

const PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

type PeriodLabel = (typeof PERIODS)[number]["label"];

interface Props {
  tickerCode: string;
  tradeDate: string;
  tradeType: string;
  filledPrice?: number;
}

export default function DiaryMiniChart({ tickerCode, tradeDate, tradeType, filledPrice }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const targetDateRef = useRef<string>("");
  const inRangeRef = useRef(false);

  // 거래일로부터 경과 일수에 따라 기본 기간 자동 선택
  const defaultPeriod = (() => {
    const elapsed = Math.floor((Date.now() - new Date(tradeDate).getTime()) / 86400000);
    if (elapsed <= 7) return "1W";
    if (elapsed <= 30) return "1M";
    if (elapsed <= 90) return "3M";
    if (elapsed <= 180) return "6M";
    return "1Y";
  })() as PeriodLabel;

  const [activePeriod, setActivePeriod] = useState<PeriodLabel>(defaultPeriod);
  const [markerX, setMarkerX] = useState<number | null>(null);

  const { data: candles } = useCandleQuery(tickerCode, "day", 365);
  const isBuy = tradeType === "BUY";
  const markerColor = isBuy ? "#F04452" : "#3B7DEB";

  // 차트 마운트 — 범위 변경 구독으로 x 좌표 갱신
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#FAFBFF" },
        textColor: "#9CA3AF",
        fontSize: 10,
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F3F4F6", style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: "#9CA3AF",
        scaleMargins: { top: 0.2, bottom: 0.2 },
        autoScale: true,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        fixRightEdge: false,
        fixLeftEdge: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tickMarkFormatter: (time: any) => {
          const s = typeof time === "string" ? time : toDateString(time);
          const [, m, d] = s.split("-");
          return `${m}/${d}`;
        },
      },
      crosshair: {
        vertLine: { color: "#D1D5DB", width: 1, style: 2, labelBackgroundColor: "#1F2937" },
        horzLine: { color: "#D1D5DB", width: 1, style: 2, labelBackgroundColor: "#1F2937" },
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#F04452",
      downColor: "#3B7DEB",
      borderUpColor: "#F04452",
      borderDownColor: "#3B7DEB",
      wickUpColor: "#F04452",
      wickDownColor: "#3B7DEB",
    });

    // fitContent 이후 범위가 확정되면 x 좌표 계산
    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      if (!inRangeRef.current || !targetDateRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x = chart.timeScale().timeToCoordinate(toBusinessDay(targetDateRef.current) as any);
      setMarkerX(x ?? null);
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candles || !seriesRef.current || !chartRef.current) return;

    const periodDays = PERIODS.find((p) => p.label === activePeriod)?.days ?? 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const timeMap = new Map<string, (typeof candles)[0]>();
    for (const c of [...candles].sort((a, b) => a.time - b.time)) {
      timeMap.set(toDateString(c.time), c);
    }
    const allSorted = [...timeMap.values()].sort((a, b) => a.time - b.time);
    const filtered = allSorted.filter((c) => toDateString(c.time) >= cutoffStr);

    seriesRef.current.setData(
      filtered.map((c) => ({
        time: toDateString(c.time),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    if (tradeDate < cutoffStr || filtered.length === 0) {
      inRangeRef.current = false;
      targetDateRef.current = "";
      setMarkerX(null);
    } else {
      // 거래일이 장 없는 날이면 직전 거래일로 fallback
      const targetDate = timeMap.has(tradeDate)
        ? tradeDate
        : (() => {
            const before = allSorted.filter((c) => toDateString(c.time) <= tradeDate);
            return before.length
              ? toDateString(before[before.length - 1].time)
              : toDateString(filtered[0].time);
          })();

      inRangeRef.current = true;
      targetDateRef.current = targetDate;
    }

    // fitContent → subscribeVisibleTimeRangeChange 콜백 발동 → x 계산
    chartRef.current.timeScale().fitContent();

    // 구독 콜백이 안 뜨는 경우 폴백
    setTimeout(() => {
      if (!inRangeRef.current || !targetDateRef.current || !chartRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x = chartRef.current.timeScale().timeToCoordinate(toBusinessDay(targetDateRef.current) as any);
      if (x != null) setMarkerX(x);
    }, 200);
  }, [candles, activePeriod, tradeDate]);

  if (!tickerCode) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-[#FAFBFF] mt-1">
      <div className="flex items-center justify-end gap-0.5 px-3 pt-2">
        {PERIODS.map(({ label, days }) => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          const isDisabled = tradeDate < cutoff.toISOString().slice(0, 10);
          return (
            <button
              key={label}
              onClick={() => !isDisabled && setActivePeriod(label)}
              disabled={isDisabled}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activePeriod === label
                  ? "text-white bg-[#22C55E]"
                  : isDisabled
                  ? "text-gray-200 cursor-not-allowed"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative h-[150px]">
        <div ref={containerRef} className="h-full" />

        {/* 수직선 */}
        {markerX != null && (
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ left: markerX, backgroundColor: markerColor, opacity: 0.35, zIndex: 5 }}
          />
        )}

        {/* 화살표 — 직접 배치 */}
        {markerX != null && isBuy && (
          <div
            className="absolute pointer-events-none"
            style={{ left: markerX, bottom: 8, transform: "translateX(-50%)", zIndex: 10 }}
          >
            <svg width={10} height={9} viewBox="0 0 10 9">
              <polygon points="5,0 10,9 0,9" fill={markerColor} />
            </svg>
          </div>
        )}
        {markerX != null && !isBuy && (
          <div
            className="absolute pointer-events-none"
            style={{ left: markerX, top: 8, transform: "translateX(-50%)", zIndex: 10 }}
          >
            <svg width={10} height={9} viewBox="0 0 10 9">
              <polygon points="5,9 10,0 0,0" fill={markerColor} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
