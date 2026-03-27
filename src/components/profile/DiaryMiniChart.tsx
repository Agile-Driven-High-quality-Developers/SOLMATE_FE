import { useRef, useEffect, useState, useMemo } from "react";
import { createChart, CandlestickSeries, type UTCTimestamp } from "lightweight-charts";
import { useCandleQuery, type PeriodType } from "@/api/stockApi";

const KST_OFFSET = 9 * 3600;

const PERIODS: { label: string; value: PeriodType }[] = [
  { label: "1분", value: "1" },
  { label: "5분", value: "5" },
  { label: "30분", value: "30" },
  { label: "60분", value: "60" },
  { label: "일", value: "day" },
  { label: "주", value: "week" },
  { label: "월", value: "month" },
  { label: "년", value: "year" },
];

const MINUTE_PERIODS = new Set<PeriodType>(["1", "5", "30", "60"]);

const INITIAL_LIMIT: Record<PeriodType, number> = {
  "1": 0, "5": 0, "30": 0, "60": 0,
  day: 365,
  week: 365 * 3,
  month: 365 * 5,
  year: 365 * 10,
};

const LOAD_MORE_STEP = 365;
const MAX_LIMIT = 365 * 20;

const UP_COLOR = "#F04452";
const DOWN_COLOR = "#3B7DEB";

function toChartTime(epochSec: number, isMinute: boolean): UTCTimestamp | string {
  const adjusted = epochSec + KST_OFFSET;
  if (isMinute) return adjusted as UTCTimestamp;
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

interface Props {
  tickerCode: string;
  tradeDate: string;       // "YYYY-MM-DD"
  tradeDateTime?: string;  // ISO string
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
  const elapsed = Math.floor((Date.now() - new Date(tradeDate).getTime()) / 86400000);

  // 기본 기간: 오늘=5분, 최근=일봉, 오래됨=일봉
  const defaultPeriod: PeriodType = elapsed === 0 ? "5" : "day";

  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);
  const [limit, setLimit] = useState(INITIAL_LIMIT[defaultPeriod]);
  const [markerX, setMarkerX] = useState<number | null>(null);

  const isMinute = MINUTE_PERIODS.has(period);

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const loadingMoreRef = useRef(false);
  const initialScrollDoneRef = useRef(false);
  const isMinuteRef = useRef(isMinute);
  const tradeChartTimeRef = useRef<UTCTimestamp | string | null>(null);

  // 거래 시각 → 차트 time 값
  const tradeEpoch = useMemo(
    () => tradeDateTime ? new Date(tradeDateTime).getTime() / 1000 : new Date(tradeDate).getTime() / 1000,
    [tradeDateTime, tradeDate]
  );

  const { data: candles, isPending } = useCandleQuery(tickerCode, period, limit);

  const handlePeriodChange = (p: PeriodType) => {
    setPeriod(p);
    setLimit(INITIAL_LIMIT[p]);
    initialScrollDoneRef.current = false; // 기간 변경 시 다시 거래 시점으로 이동
    setMarkerX(null);
  };

  const isBuy = tradeType === "BUY";
  const markerColor = isBuy ? "#22C55E" : "#3B7DEB";
  const minuteEnabled = elapsed <= 30;

  // 차트 마운트
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#FFFFFF" },
        textColor: "#9CA3AF",
        fontSize: 11,
        fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F3F4F6", style: 1 },
      },
      rightPriceScale: { borderVisible: false, textColor: "#9CA3AF" },
      leftPriceScale: { visible: false },
      timeScale: { borderVisible: false, timeVisible: false },
      crosshair: {
        vertLine: { color: "#D1D5DB", width: 1, style: 2, labelBackgroundColor: "#1F2937" },
        horzLine: { color: "#D1D5DB", width: 1, style: 2, labelBackgroundColor: "#1F2937" },
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderUpColor: UP_COLOR,
      borderDownColor: DOWN_COLOR,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    });

    // 좌측 끝 근접 시 추가 데이터 로드
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || loadingMoreRef.current) return;
      if (range.from < 10) {
        loadingMoreRef.current = true;
        setLimit((prev) => Math.min(prev + LOAD_MORE_STEP, MAX_LIMIT));
      }
    });

    // 범위 변경 시 마커 x 좌표 재계산
    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      const target = tradeChartTimeRef.current;
      if (!target) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x = typeof target === "number"
        ? chart.timeScale().timeToCoordinate(target)
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

  // timeVisible 동기화
  useEffect(() => {
    isMinuteRef.current = isMinute;
    chartRef.current?.applyOptions({ timeScale: { timeVisible: isMinute } });
  }, [isMinute]);

  // 데이터 업데이트
  useEffect(() => {
    if (!candles || !seriesRef.current || !chartRef.current) return;

    const timeMap = new Map<string, (typeof candles)[0]>();
    for (const c of [...candles].sort((a, b) => a.time - b.time)) {
      timeMap.set(toChartTime(c.time, isMinute).toString(), c);
    }
    const sorted = [...timeMap.values()].sort((a, b) => a.time - b.time);

    seriesRef.current.setData(
      sorted.map((c) => ({
        time: toChartTime(c.time, isMinute),
        open: c.open, high: c.high, low: c.low, close: c.close,
      }))
    );

    // 거래 시각과 가장 가까운 실제 캔들 시간을 사용 (timeToCoordinate는 실제 바 기준)
    const nearest = sorted.reduce((prev, curr) =>
      Math.abs(curr.time - tradeEpoch) < Math.abs(prev.time - tradeEpoch) ? curr : prev
    , sorted[0]);
    const tct = nearest ? toChartTime(nearest.time, isMinute) : toChartTime(tradeEpoch, isMinute);
    tradeChartTimeRef.current = tct;

    if (!loadingMoreRef.current) {
      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        // 거래 시점 중심으로 visible range 설정
        if (isMinute) {
          // 분봉: ±3시간 윈도우
          const epochAdj = (tradeEpoch + KST_OFFSET) as UTCTimestamp;
          chartRef.current.timeScale().setVisibleRange({
            from: (epochAdj - 3 * 3600) as UTCTimestamp,
            to: (epochAdj + 3 * 3600) as UTCTimestamp,
          });
        } else {
          // 일봉 이상: 거래일 전후 30일 윈도우
          chartRef.current.timeScale().setVisibleRange({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            from: toBusinessDay(addDays(tradeDate, -30)) as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to: toBusinessDay(addDays(tradeDate, 30)) as any,
          });
        }
      } else {
        chartRef.current.timeScale().fitContent();
      }
    }
    loadingMoreRef.current = false;

    // 마커 x 좌표 계산 (fitContent/setVisibleRange 후 반영)
    setTimeout(() => {
      if (!chartRef.current || !tct) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x = typeof tct === "number"
        ? chartRef.current.timeScale().timeToCoordinate(tct)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : chartRef.current.timeScale().timeToCoordinate(toBusinessDay(tct as string) as any);
      setMarkerX(x ?? null);
    }, 200);
  }, [candles, isMinute, tradeDate, tradeEpoch]);

  if (!tickerCode) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 mt-1">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[12px] font-semibold text-gray-500">체결 시점 차트</span>
        <div className="flex items-center gap-0.5">
          {PERIODS.map(({ label, value }) => {
            const isMinutePeriod = MINUTE_PERIODS.has(value);
            const disabled = isMinutePeriod && !minuteEnabled;
            return (
              <button
                key={value}
                disabled={disabled}
                onClick={() => !disabled && handlePeriodChange(value)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  disabled
                    ? "text-gray-200 cursor-not-allowed"
                    : period === value
                    ? "text-[#0046FF] bg-blue-50"
                    : "text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative h-[220px] overflow-hidden">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-b-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-[#0046FF] border-t-transparent animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="h-full" />

        {/* 수직선 */}
        {markerX != null && (
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ left: markerX, backgroundColor: markerColor, opacity: 0.4, zIndex: 5 }}
          />
        )}
        {/* 화살표 */}
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
