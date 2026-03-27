import { useRef, useEffect, useState, useMemo } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";
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

function toBusinessDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function epochToKstHHMM(epochSec: number): string {
  const adjusted = epochSec + KST_OFFSET;
  const d = new Date(adjusted * 1000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

const DAILY_PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

const MINUTE_PERIODS = [
  { label: "30분", halfMins: 15 },
  { label: "1H", halfMins: 30 },
  { label: "3H", halfMins: 90 },
  { label: "전체", halfMins: null as null },
] as const;

type DailyPeriodLabel = (typeof DAILY_PERIODS)[number]["label"];
type MinutePeriodLabel = (typeof MINUTE_PERIODS)[number]["label"];

interface Props {
  tickerCode: string;
  tradeDate: string;       // "YYYY-MM-DD"
  tradeDateTime?: string;  // ISO string (체결 시각, 분봉 마킹용)
  tradeType: string;
  filledPrice?: number;
}

export default function DiaryMiniChart({
  tickerCode,
  tradeDate,
  tradeDateTime,
  tradeType,
  filledPrice: _filledPrice,
}: Props) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = tradeDate === todayStr;
  const elapsed = Math.floor((Date.now() - new Date(tradeDate).getTime()) / 86400000);

  // 일봉 기간 버튼 비활성화 기준
  const isDailyPeriodDisabled = (days: number, label: string) =>
    label !== "1Y" && elapsed > days * 2;

  const defaultDailyPeriod = (
    DAILY_PERIODS.find(({ days, label }) => !isDailyPeriodDisabled(days, label))?.label ?? "1Y"
  ) as DailyPeriodLabel;

  const [activePeriod, setActivePeriod] = useState<string>(
    isToday ? "전체" : defaultDailyPeriod
  );
  const [markerX, setMarkerX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  // 분봉: epoch(number), 일봉: dateStr(string)
  const targetRef = useRef<number | string>("");
  const inRangeRef = useRef(false);
  const isTodayRef = useRef(isToday);

  // 체결 시각 → UTC epoch (분봉 마킹)
  const tradeEpoch = useMemo(
    () => (tradeDateTime ? new Date(tradeDateTime).getTime() / 1000 : Date.now() / 1000),
    [tradeDateTime]
  );

  // 데이터 쿼리 (오늘=분봉, 과거=일봉)
  const fetchDays = Math.max(365, elapsed + 365 + 30);
  const { data: dailyCandles } = useCandleQuery(!isToday ? tickerCode : "", "day", fetchDays);
  const { data: minuteCandles } = useCandleQuery(isToday ? tickerCode : "", "5");
  const candles = isToday ? minuteCandles : dailyCandles;

  const isBuy = tradeType === "BUY";
  const markerColor = isBuy ? "#F04452" : "#3B7DEB";

  // 차트 마운트
  useEffect(() => {
    if (!containerRef.current) return;
    const todayMode = isTodayRef.current;

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
        tickMarkFormatter: todayMode
          ? (time: any) => epochToKstHHMM(typeof time === "number" ? time : Number(time))
          : (time: any, tickMarkType: number) => {
              const s = typeof time === "string" ? time : toDateString(time);
              const [y, m, d] = s.split("-");
              if (tickMarkType === 0) return y;
              if (tickMarkType === 1) return `${parseInt(m)}월`;
              return `${parseInt(m)}/${parseInt(d)}`;
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

    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      if (!inRangeRef.current || !targetRef.current) return;
      const target = targetRef.current;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x = isTodayRef.current
        ? chart.timeScale().timeToCoordinate(target as number)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : chart.timeScale().timeToCoordinate(toBusinessDay(target as string) as any);
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

  // 데이터 세팅
  useEffect(() => {
    if (!candles || !seriesRef.current || !chartRef.current) return;

    if (isToday) {
      // ── 분봉 모드 ────────────────────────────────────────────
      const sorted = [...candles].sort((a, b) => a.time - b.time);
      const halfMins = MINUTE_PERIODS.find((p) => p.label === activePeriod)?.halfMins ?? null;

      // 오늘 날짜 캔들만 사용 (API가 여러 날 데이터를 반환할 수 있음)
      const todayCandles = sorted.filter((c) => toDateString(c.time) === tradeDate);
      const filtered =
        halfMins == null
          ? todayCandles
          : todayCandles.filter((c) => Math.abs(c.time - tradeEpoch) <= halfMins * 60);

      if (filtered.length === 0) {
        inRangeRef.current = false;
        targetRef.current = "";
        setMarkerX(null);
        seriesRef.current.setData([]);
        return;
      }

      seriesRef.current.setData(
        filtered.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      // 체결 시각 직전 봉
      const nearest = [...sorted].reverse().find((c) => c.time <= tradeEpoch);
      inRangeRef.current = true;
      targetRef.current = nearest ? nearest.time : filtered[0].time;

      chartRef.current.timeScale().fitContent();

      setTimeout(() => {
        if (!inRangeRef.current || !targetRef.current || !chartRef.current) return;
        const x = chartRef.current.timeScale().timeToCoordinate(targetRef.current as number);
        if (x != null) setMarkerX(x);
      }, 200);
    } else {
      // ── 일봉 모드 ────────────────────────────────────────────
      const periodDays = DAILY_PERIODS.find((p) => p.label === activePeriod)?.days ?? 30;
      const leftCutoffStr = addDays(tradeDate, -periodDays);
      const today = new Date().toISOString().slice(0, 10);
      const rightCutoffStr = addDays(tradeDate, 365) < today ? addDays(tradeDate, 365) : today;

      const timeMap = new Map<string, (typeof candles)[0]>();
      for (const c of [...candles].sort((a, b) => a.time - b.time)) {
        timeMap.set(toDateString(c.time), c);
      }
      const allSorted = [...timeMap.values()].sort((a, b) => a.time - b.time);
      const filtered = allSorted.filter((c) => {
        const d = toDateString(c.time);
        return d >= leftCutoffStr && d <= rightCutoffStr;
      });

      seriesRef.current.setData(
        filtered.map((c) => ({
          time: toDateString(c.time),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      if (filtered.length === 0) {
        inRangeRef.current = false;
        targetRef.current = "";
        setMarkerX(null);
      } else {
        inRangeRef.current = true;
        targetRef.current =
          tradeDate >= leftCutoffStr
            ? tradeDate
            : (() => {
                const before = allSorted.filter((c) => toDateString(c.time) <= tradeDate);
                return before.length
                  ? toDateString(before[before.length - 1].time)
                  : toDateString(filtered[0].time);
              })();
      }

      chartRef.current.timeScale().setVisibleRange({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        from: toBusinessDay(leftCutoffStr) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to: toBusinessDay(rightCutoffStr) as any,
      });

      setTimeout(() => {
        if (!inRangeRef.current || !targetRef.current || !chartRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const x = chartRef.current
          .timeScale()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .timeToCoordinate(toBusinessDay(targetRef.current as string) as any);
        if (x != null) setMarkerX(x);
      }, 200);
    }
  }, [candles, activePeriod, tradeDate, tradeEpoch, isToday]);

  if (!tickerCode) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-[#FAFBFF] mt-1">
      <div className="flex items-center justify-end gap-0.5 px-3 pt-2">
        {isToday
          ? MINUTE_PERIODS.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActivePeriod(label)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activePeriod === label
                    ? "text-white bg-[#0046FF]"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))
          : DAILY_PERIODS.map(({ label, days }) => {
              const disabled = isDailyPeriodDisabled(days, label);
              return (
                <button
                  key={label}
                  onClick={() => !disabled && setActivePeriod(label)}
                  disabled={disabled}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    activePeriod === label
                      ? "text-white bg-[#0046FF]"
                      : disabled
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

        {markerX != null && (
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ left: markerX, backgroundColor: markerColor, opacity: 0.35, zIndex: 5 }}
          />
        )}

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
