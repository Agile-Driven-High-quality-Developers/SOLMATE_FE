import { useRef, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import {
  createChart,
  CandlestickSeries,
  type UTCTimestamp,
} from "lightweight-charts";
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
  "1": 0,
  "5": 0,
  "30": 0,
  "60": 0,
  day: 365,
  week: 365 * 3,
  month: 365 * 5,
  year: 365 * 10,
};

const LOAD_MORE_STEP = 365;
const MAX_LIMIT = 365 * 20;

// 탭 변경 시 거래 캔들 기준 양쪽에 보여줄 캔들 수
const HALF_WINDOW: Record<PeriodType, number> = {
  "1": 60,
  "5": 36,
  "30": 12,
  "60": 6,
  day: 30,
  week: 26,
  month: 12,
  year: 5,
};

const UP_COLOR = "#F04452";
const DOWN_COLOR = "#3B7DEB";

function toChartTime(
  epochSec: number,
  isMinute: boolean,
): UTCTimestamp | string {
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


interface Props {
  tickerCode: string;
  tradeDate: string; // "YYYY-MM-DD"
  tradeDateTime?: string; // ISO string
  tradeType: string;
  filledPrice?: number;
  chartHeight?: number;
}

export default function DiaryMiniChart({
  tickerCode,
  tradeDate,
  tradeDateTime,
  tradeType,
  filledPrice: _filledPrice,
  chartHeight = 220,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const elapsed = Math.floor(
    (Date.now() - new Date(tradeDate).getTime()) / 86400000,
  );

  // 비분봉 기간은 거래일이 데이터 범위에 포함되도록 최소 limit 보장
  const getLimit = (p: PeriodType) => {
    if (MINUTE_PERIODS.has(p)) return INITIAL_LIMIT[p];
    return Math.max(INITIAL_LIMIT[p], elapsed + 60);
  };

  // URL에 저장된 기간 복원 (새로고침 시 유지), 없으면 기본값
  const getFallbackPeriod = (): PeriodType => {
    const saved = searchParams.get("chartPeriod") as PeriodType | null;
    if (saved && PERIODS.some((p) => p.value === saved)) {
      // 분봉은 오늘 거래일 때만 허용
      if (MINUTE_PERIODS.has(saved) && elapsed > 30) return "day";
      return saved;
    }
    return elapsed === 0 ? "5" : "day";
  };

  const isDark = useThemeStore((s) => s.theme === "dark");

  const [period, setPeriod] = useState<PeriodType>(getFallbackPeriod);
  const [limit, setLimit] = useState(() => getLimit(getFallbackPeriod()));
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
    () =>
      tradeDateTime
        ? new Date(tradeDateTime).getTime() / 1000
        : new Date(tradeDate).getTime() / 1000,
    [tradeDateTime, tradeDate],
  );

  const { data: candles, isPending } = useCandleQuery(
    tickerCode,
    period,
    limit,
  );

  const handlePeriodChange = (p: PeriodType) => {
    setPeriod(p);
    setLimit(getLimit(p));
    initialScrollDoneRef.current = false;
    setMarkerX(null);
    seriesRef.current?.setData([]);
    setSearchParams(
      (prev) => {
        prev.set("chartPeriod", p);
        return prev;
      },
      { replace: true },
    );
  };

  const isBuy = tradeType === "BUY";
  const markerColor = "#22C55E";
  const minuteEnabled = elapsed <= 30;

  // 차트 마운트
  useEffect(() => {
    if (!containerRef.current) return;

    const dark = useThemeStore.getState().theme === "dark";
    const bg = dark ? "#131722" : "#FFFFFF";
    const textColor = dark ? "#d1d4dc" : "#9CA3AF";
    const gridColor = dark ? "#1e222d" : "#F3F4F6";
    const crosshairColor = dark ? "#4b5563" : "#D1D5DB";

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: bg },
        textColor,
        fontSize: 11,
        fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: gridColor, style: 1 },
      },
      rightPriceScale: { borderVisible: false, textColor },
      leftPriceScale: { visible: false },
      timeScale: { borderVisible: false, timeVisible: false },
      crosshair: {
        vertLine: {
          color: crosshairColor,
          width: 1,
          style: 2,
          labelBackgroundColor: "#1F2937",
        },
        horzLine: {
          color: crosshairColor,
          width: 1,
          style: 2,
          labelBackgroundColor: "#1F2937",
        },
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
      const x =
        typeof target === "number"
          ? chart.timeScale().timeToCoordinate(target)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chart
              .timeScale()
              .timeToCoordinate(toBusinessDay(target as string) as any);
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

  // 테마 변경 시 차트 색상 업데이트
  useEffect(() => {
    if (!chartRef.current) return;
    const bg = isDark ? "#131722" : "#FFFFFF";
    const textColor = isDark ? "#d1d4dc" : "#9CA3AF";
    const gridColor = isDark ? "#1e222d" : "#F3F4F6";
    const crosshairColor = isDark ? "#4b5563" : "#D1D5DB";
    chartRef.current.applyOptions({
      layout: { background: { color: bg }, textColor },
      grid: { horzLines: { color: gridColor } },
      crosshair: {
        vertLine: { color: crosshairColor },
        horzLine: { color: crosshairColor },
      },
    });
    chartRef.current.priceScale("right").applyOptions({ textColor });
  }, [isDark]);

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
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    // 거래 시각과 가장 가까운 실제 캔들 인덱스 탐색
    let nearestIdx = 0;
    if (isMinute) {
      // 분봉: epoch 기준 가장 가까운 캔들
      sorted.forEach((c, i) => {
        if (
          Math.abs(c.time - tradeEpoch) <
          Math.abs(sorted[nearestIdx].time - tradeEpoch)
        ) {
          nearestIdx = i;
        }
      });
    } else {
      // 일봉 이상: 거래일과 가장 가까운 날짜의 캔들 (주봉=월요일, 월봉=1일 등 정확히 안 맞을 수 있음)
      const tradeDateMs = new Date(tradeDate).getTime();
      sorted.forEach((c, i) => {
        const cMs = new Date(toChartTime(c.time, false) as string).getTime();
        const nearestMs = new Date(
          toChartTime(sorted[nearestIdx].time, false) as string,
        ).getTime();
        if (Math.abs(cMs - tradeDateMs) < Math.abs(nearestMs - tradeDateMs)) {
          nearestIdx = i;
        }
      });
    }
    const nearest = sorted[nearestIdx];
    const tct = nearest
      ? toChartTime(nearest.time, isMinute)
      : toChartTime(tradeEpoch, isMinute);
    tradeChartTimeRef.current = tct;

    if (loadingMoreRef.current) {
      // 좌측 스크롤로 추가 데이터 로드 완료 → 뷰 유지, 플래그 리셋만
      loadingMoreRef.current = false;
    } else {
      initialScrollDoneRef.current = true;
      // 거래 캔들을 차트 가운데로
      const half = HALF_WINDOW[period];
      chartRef.current.timeScale().setVisibleLogicalRange({
        from: nearestIdx - half,
        to: nearestIdx + half,
      });
      // setVisibleLogicalRange가 구독 콜백을 동기 실행해 loadingMoreRef를 true로
      // 세팅했을 수 있으므로 여기서 리셋하지 않음 (다음 effect 실행 시 리셋됨)
    }

    // 마커 x 좌표 계산 (fitContent/setVisibleRange 후 반영)
    setTimeout(() => {
      if (!chartRef.current || !tct) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x =
        typeof tct === "number"
          ? chartRef.current.timeScale().timeToCoordinate(tct)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chartRef.current
              .timeScale()
              .timeToCoordinate(toBusinessDay(tct as string) as any);
      setMarkerX(x ?? null);
    }, 200);
  }, [candles, isMinute, period, tradeDate, tradeEpoch]);

  if (!tickerCode) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mt-1">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[12px] font-semibold text-gray-500 dark:text-slate-400">
          체결 시점 차트
        </span>
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
                    ? "text-gray-200 dark:text-slate-700 cursor-not-allowed"
                    : period === value
                      ? "text-[#0046FF] bg-blue-50 dark:bg-slate-700 dark:text-blue-400"
                      : "text-gray-400 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ height: chartHeight }}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10 rounded-b-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-[#0046FF] border-t-transparent animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="h-full" />

        {/* 수직선 */}
        {markerX != null && (
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{
              left: markerX,
              backgroundColor: markerColor,
              opacity: 0.4,
              zIndex: 5,
            }}
          />
        )}
        {/* 화살표 */}
        {markerX != null && isBuy && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: markerX,
              bottom: 8,
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <svg width={10} height={9} viewBox="0 0 10 9">
              <polygon points="5,0 10,9 0,9" fill={markerColor} />
            </svg>
          </div>
        )}
        {markerX != null && !isBuy && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: markerX,
              top: 8,
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
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
