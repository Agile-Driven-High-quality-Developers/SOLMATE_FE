import { useRef, useEffect, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type UTCTimestamp,
} from "lightweight-charts";
import { useCandleQuery, type PeriodType } from "@/api/stockApi";

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

// 분봉별 초기 로드 범위 (일 단위)
const INITIAL_LIMIT: Record<PeriodType, number> = {
  "1": 0, "5": 0, "30": 0, "60": 0,
  day: 365,
  week: 365 * 3,   // ~3년치 주봉
  month: 365 * 5,  // ~5년치 월봉
  year: 365 * 10,  // ~10년치 년봉
};
const LOAD_MORE_STEP = 365; // 스크롤 시 추가 로드 단위 (일)
const MAX_LIMIT = 365 * 20; // 최대 20년

// 상승 빨강 / 하락 파랑
const UP_COLOR = "#F04452";
const DOWN_COLOR = "#3B7DEB";
const UP_VOLUME = "rgba(240, 68, 82, 0.15)";
const DOWN_VOLUME = "rgba(59, 125, 235, 0.15)";

// 백엔드: KST LocalDateTime.toEpochSecond(KST) → UTC -9h 보정
const KST_OFFSET = 9 * 3600;

function toChartTime(epochSec: number, isMinute: boolean): UTCTimestamp | string {
  const adjusted = epochSec + KST_OFFSET;
  if (isMinute) return adjusted as UTCTimestamp;
  const d = new Date(adjusted * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface Props {
  stockCode: string;
}

export default function StockChart({ stockCode }: Props) {
  const [period, setPeriod] = useState<PeriodType>("day");
  const [limit, setLimit] = useState(INITIAL_LIMIT["day"]);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const loadingMoreRef = useRef(false); // 중복 fetch 방지

  const isMinute = MINUTE_PERIODS.has(period);
  const { data: candles, isPending } = useCandleQuery(stockCode, period, limit);

  // 기간 탭 변경 시 limit 초기화
  const handlePeriodChange = (p: PeriodType) => {
    setPeriod(p);
    setLimit(INITIAL_LIMIT[p]);
  };

  // 차트 인스턴스 생성 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#FFFFFF" },
        textColor: "#9CA3AF",
        fontSize: 11,
        fontFamily:
          "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F3F4F6", style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: "#9CA3AF",
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        // fixLeftEdge / fixRightEdge 제거 → 자유 스크롤
      },
      crosshair: {
        vertLine: {
          color: "#D1D5DB",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1F2937",
        },
        horzLine: {
          color: "#D1D5DB",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1F2937",
        },
      },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderUpColor: UP_COLOR,
      borderDownColor: DOWN_COLOR,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      visible: false,
    });

    // 좌측 끝 근접 시 추가 데이터 로드
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || loadingMoreRef.current) return;
      if (range.from < 10) {
        loadingMoreRef.current = true;
        setLimit((prev) => Math.min(prev + LOAD_MORE_STEP, MAX_LIMIT));
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // 기간 변경 시 timeVisible 동기화
  useEffect(() => {
    chartRef.current?.applyOptions({
      timeScale: { timeVisible: isMinute },
    });
  }, [isMinute]);

  // 데이터 업데이트
  useEffect(() => {
    if (!candles || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    // 중복 time 제거: Map 마지막 값(최신 Redis봉) 유지
    const timeMap = new Map<string, (typeof candles)[0]>();
    for (const c of [...candles].sort((a, b) => a.time - b.time)) {
      timeMap.set(toChartTime(c.time, isMinute).toString(), c);
    }
    const sorted = [...timeMap.values()].sort((a, b) => a.time - b.time);

    candleSeriesRef.current.setData(
      sorted.map((c) => ({
        time: toChartTime(c.time, isMinute),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    volumeSeriesRef.current.setData(
      sorted.map((c) => ({
        time: toChartTime(c.time, isMinute),
        value: c.volume,
        color: c.close >= c.open ? UP_VOLUME : DOWN_VOLUME,
      })),
    );

    // 초기 로드 시에만 전체 맞춤, 추가 로드 시에는 현재 위치 유지
    if (!loadingMoreRef.current) {
      chartRef.current?.timeScale().fitContent();
    }
    loadingMoreRef.current = false;
  }, [candles, isMinute]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="text-[13px] font-semibold text-gray-700">주가 차트</span>
        <div className="flex items-center gap-0.5">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors ${
                period === value
                  ? "text-[#0046FF] bg-blue-50"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="relative h-[340px]">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-b-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-[#0046FF] border-t-transparent animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="h-full" />
      </div>
    </div>
  );
}
