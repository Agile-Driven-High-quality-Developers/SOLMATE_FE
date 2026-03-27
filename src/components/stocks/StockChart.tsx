import { useRef, useEffect, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  PriceScaleMode,
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
  week: 365 * 3,
  month: 365 * 5,
  year: 365 * 10,
};

// 기간별 초기 표시 캔들 수 (화면에 보이는 범위)
// 한국 주식 장 운영시간: 09:00~15:30 = 6.5h
// 1분봉: 390개/일, 5분봉: 78개/일, 30분봉: 13개/일, 60분봉: 7개/일
const INITIAL_VISIBLE_CANDLES: Record<PeriodType, number> = {
  "1": 120,   // 2시간 (2h × 60 = 120)
  "5": 78,    // 24시간 ≈ 1 거래일 (6.5h × 12 = 78)
  "30": 91,   // 7거래일 (7 × 13 = 91)
  "60": 98,   // 2주 거래일 (14 × 7 = 98)
  day: 90,    // 90일
  week: 52,   // 1년 = 52주
  month: 60,  // 5년 = 60개월
  year: 10,   // 10년
};
const LOAD_MORE_STEP = 365;
const MAX_LIMIT = 365 * 20;

const TOTAL_HEIGHT = 350;
const MIN_CANDLE_HEIGHT = 120;
const MIN_VOLUME_HEIGHT = 40;
const DIVIDER_HEIGHT = 6;

// 상승 빨강 / 하락 파랑
const UP_COLOR = "#F04452";
const DOWN_COLOR = "#3B7DEB";

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
  const [period, setPeriod] = useState<PeriodType>("1");
  const [limit, setLimit] = useState(INITIAL_LIMIT["1"]);
  const [candleHeight, setCandleHeight] = useState(265);

  const volumeHeight = TOTAL_HEIGHT - candleHeight - DIVIDER_HEIGHT;

  const containerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const volChartRef = useRef<ReturnType<typeof createChart> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const loadingMoreRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const isSyncingRef = useRef(false);

  const isMinute = MINUTE_PERIODS.has(period);
  const { data: candles, isPending } = useCandleQuery(stockCode, period, limit);

  // 기간 탭 변경 시 limit 초기화
  const handlePeriodChange = (p: PeriodType) => {
    isInitialLoadRef.current = true;
    setPeriod(p);
    setLimit(INITIAL_LIMIT[p]);
  };

  // 구분선 드래그로 패널 높이 조절
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = candleHeight;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY;
      const next = Math.max(
        MIN_CANDLE_HEIGHT,
        Math.min(TOTAL_HEIGHT - MIN_VOLUME_HEIGHT - DIVIDER_HEIGHT, startHeight + delta),
      );
      setCandleHeight(next);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // 차트 인스턴스 생성 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current || !volumeContainerRef.current) return;

    const commonLayout = {
      background: { color: "#FFFFFF" },
      textColor: "#9CA3AF",
      fontSize: 11,
      fontFamily:
        "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    };

    // 캔들 차트 (상단)
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: commonLayout,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F3F4F6", style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: "#9CA3AF",
        mode: PriceScaleMode.Logarithmic,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        visible: false, // 시간축은 하단 거래량 차트에만 표시
      },
      crosshair: {
        vertLine: { color: "#D1D5DB", width: 1, style: 2, labelBackgroundColor: "#1F2937" },
        horzLine: { color: "#D1D5DB", width: 1, style: 2, labelBackgroundColor: "#1F2937" },
      },
      handleScroll: true,
      handleScale: true,
    });

    // 거래량 차트 (하단)
    const volChart = createChart(volumeContainerRef.current, {
      autoSize: true,
      layout: commonLayout,
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
        visible: false,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: "#D1D5DB", width: 1, style: 2, labelVisible: false },
        horzLine: { visible: false },
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

    const volumeSeries = volChart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "right",
    });

    volChart.priceScale("right").applyOptions({
      scaleMargins: { top: 0.1, bottom: 0 },
      visible: false,
    });

    // 캔들 차트 스크롤 → 거래량 동기화 + 추가 로드
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range) return;
      if (!isSyncingRef.current) {
        isSyncingRef.current = true;
        volChart.timeScale().setVisibleLogicalRange(range);
        isSyncingRef.current = false;
      }
      if (!loadingMoreRef.current && range.from < 10) {
        loadingMoreRef.current = true;
        setLimit((prev) => Math.min(prev + LOAD_MORE_STEP, MAX_LIMIT));
      }
    });

    // 거래량 차트 스크롤 → 캔들 동기화
    volChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isSyncingRef.current) return;
      isSyncingRef.current = true;
      chart.timeScale().setVisibleLogicalRange(range);
      isSyncingRef.current = false;
    });

    chartRef.current = chart;
    volChartRef.current = volChart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      volChart.remove();
      chartRef.current = null;
      volChartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // 기간 변경 시 timeVisible 동기화 (분봉만 시간 표시)
  useEffect(() => {
    chartRef.current?.applyOptions({ timeScale: { timeVisible: isMinute } });
    volChartRef.current?.applyOptions({ timeScale: { timeVisible: isMinute } });
  }, [isMinute]);

  // 데이터 업데이트
  useEffect(() => {
    if (!candles || !candleSeriesRef.current || !volumeSeriesRef.current) return;

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
        color: c.close >= c.open ? UP_COLOR : DOWN_COLOR,
      })),
    );

    if (!loadingMoreRef.current && isInitialLoadRef.current) {
      const total = sorted.length;
      const visible = INITIAL_VISIBLE_CANDLES[period];
      if (total > visible) {
        chartRef.current?.timeScale().setVisibleLogicalRange({
          from: total - visible - 1,
          to: total - 1,
        });
      } else {
        chartRef.current?.timeScale().fitContent();
      }
      isInitialLoadRef.current = false;
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
      <div className="relative" style={{ height: TOTAL_HEIGHT }}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-b-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-[#0046FF] border-t-transparent animate-spin" />
          </div>
        )}

        {/* 캔들 패널 */}
        <div ref={containerRef} style={{ height: candleHeight }} />

        {/* 드래그 구분선 */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="flex items-center justify-center bg-gray-50 border-y border-gray-100 cursor-row-resize select-none"
          style={{ height: DIVIDER_HEIGHT }}
        >
          <div className="w-8 h-0.5 rounded-full bg-gray-300" />
        </div>

        {/* 거래량 패널 */}
        <div ref={volumeContainerRef} style={{ height: volumeHeight }} />
      </div>
    </div>
  );
}
