import { useRef, useEffect, useState, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  PriceScaleMode,
  type UTCTimestamp,
  type IChartApi,
} from "lightweight-charts";
import { useCandleQuery, type CandleData, type PeriodType } from "@/api/stockApi";
import { useThemeStore } from "@/store/themeStore";
import { stompSubscribe } from "@/lib/stompClient";

// --- 증권사 표준 색상 정의 ---
const COLORS = {
  up: "#F04452", // 국내 증권사 Red
  down: "#3B7DEB", // 국내 증권사 Blue
  darkBg: "#131722", // 트레이딩뷰 표준 다크 배경
  lightBg: "#ffffff",
  darkGrid: "#1e222d",
  lightGrid: "#f0f3fa",
  darkText: "#d1d4dc",
  lightText: "#4b5563",
};

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

const INITIAL_VISIBLE_CANDLES: Record<PeriodType, number> = {
  "1": 120,
  "5": 78,
  "30": 91,
  "60": 98,
  day: 90,
  week: 52,
  month: 60,
  year: 10,
};

const LOAD_MORE_STEP = 365;
const MAX_LIMIT = 365 * 20;

const UP_COLOR = "#F04452";
const DOWN_COLOR = "#3B7DEB";

const KST_OFFSET = 9 * 3600;

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

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

interface OhlcvInfo {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
}

interface Props {
  stockCode: string;
}

export default function StockChart({ stockCode }: Props) {
  const [period, setPeriod] = useState<PeriodType>("1");
  const [limit, setLimit] = useState(INITIAL_LIMIT["1"]);
  const [ohlcv, setOhlcv] = useState<OhlcvInfo | null>(null);
  const isDark = useThemeStore((s) => s.theme === "dark");

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const loadingMoreRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const lastRestCandleRef = useRef<CandleData | null>(null);
  const firstDailyVolumeRef = useRef<number | null>(null);

  const isMinute = MINUTE_PERIODS.has(period);
  const { data: candles, isPending } = useCandleQuery(stockCode, period, limit);

  const handlePeriodChange = (p: PeriodType) => {
    isInitialLoadRef.current = true;
    setPeriod(p);
    setLimit(INITIAL_LIMIT[p]);
    setOhlcv(null);
  };

  // 차트 인스턴스 생성 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current) return;

    const dark = useThemeStore.getState().theme === "dark";
    const bg = dark ? COLORS.darkBg : COLORS.lightBg;
    const textColor = dark ? COLORS.darkText : COLORS.lightText;
    const gridColor = dark ? COLORS.darkGrid : COLORS.lightGrid;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: bg },
        textColor,
        fontSize: 11,
        fontFamily:
          "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        panes: {
          enableResize: true,
          separatorColor: dark ? COLORS.darkGrid : "#F3F4F6",
          separatorHoverColor: dark ? "#2a2e39" : "#E5E7EB",
        },
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: gridColor, style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor,
        mode: PriceScaleMode.Logarithmic,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
      },
      crosshair: {
        vertLine: {
          color: dark ? "#4b5563" : "#D1D5DB",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1F2937",
        },
        horzLine: {
          color: dark ? "#4b5563" : "#D1D5DB",
          width: 1,
          style: 2,
          labelBackgroundColor: "#1F2937",
        },
      },
      handleScroll: true,
      handleScale: true,
    });

    // 캔들 시리즈 (pane 0)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderUpColor: UP_COLOR,
      borderDownColor: DOWN_COLOR,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    });

    // 거래량 히스토그램 시리즈 (pane 1) — "right" 스케일 사용해야 축에 표시됨
    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: {
          type: "custom",
          formatter: formatVolume,
        },
        priceScaleId: "right",
      },
      1, // paneIndex = 1
    );

    // pane 1의 right 스케일: 로그 모드 해제 + 레이블 표시
    chart
      .panes()[1]
      ?.priceScale("right")
      .applyOptions({
        mode: PriceScaleMode.Normal,
        scaleMargins: { top: 0.1, bottom: 0 },
        visible: true,
        borderVisible: false,
        textColor,
      });

    // pane 높이 비율 설정 (캔들 : 거래량 ≈ 2 : 1)
    try {
      const panes = chart.panes();
      if (panes[0] && panes[1]) {
        panes[0].setStretchFactor(2);
        panes[1].setStretchFactor(1);
      }
    } catch {
      // 미지원 시 무시
    }

    // OHLCV 크로스헤어 구독
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setOhlcv(null);
        return;
      }
      const candle = param.seriesData.get(candleSeries) as
        | { open: number; high: number; low: number; close: number }
        | undefined;
      const vol = param.seriesData.get(volumeSeries) as
        | { value: number }
        | undefined;
      if (candle) {
        setOhlcv({
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: vol?.value ?? 0,
          isUp: candle.close >= candle.open,
        });
      } else {
        setOhlcv(null);
      }
    });

    // 왼쪽으로 스크롤 시 추가 로드
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range) return;
      if (!loadingMoreRef.current && range.from < 10) {
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

  // 테마 변경 시 차트 색상 업데이트
  useEffect(() => {
    if (!chartRef.current) return;
    const bg = isDark ? COLORS.darkBg : COLORS.lightBg;
    const textColor = isDark ? COLORS.darkText : COLORS.lightText;
    const gridColor = isDark ? COLORS.darkGrid : COLORS.lightGrid;
    chartRef.current.applyOptions({
      layout: { background: { color: bg }, textColor },
      grid: { horzLines: { color: gridColor } },
      crosshair: {
        vertLine: { color: isDark ? "#4b5563" : "#D1D5DB" },
        horzLine: { color: isDark ? "#4b5563" : "#D1D5DB" },
      },
    });
    chartRef.current.panes()[1]?.priceScale("right").applyOptions({ textColor });
  }, [isDark]);

  // 기간 변경 시 timeVisible 동기화
  useEffect(() => {
    chartRef.current?.applyOptions({ timeScale: { timeVisible: isMinute } });
  }, [isMinute]);

  // 데이터 업데이트
  const updateData = useCallback(() => {
    if (!candles || !candleSeriesRef.current || !volumeSeriesRef.current)
      return;

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

    // 주/월/년봉 STOMP 집계를 위해 마지막 REST 봉 저장
    if (!isMinute && sorted.length > 0) {
      lastRestCandleRef.current = sorted[sorted.length - 1];
      firstDailyVolumeRef.current = null; // 기간 전환 또는 새 데이터 로드 시 리셋
    }
  }, [candles, isMinute, period]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  // 분봉 실시간 구독
  useEffect(() => {
    if (!MINUTE_PERIODS.has(period) || !stockCode) return;

    const unsub = stompSubscribe(
      `/topic/stocks/${stockCode}/candle/${period}min`,
      (message) => {
        const candle: CandleData = JSON.parse(message.body);
        const chartTime = toChartTime(candle.time, true);

        candleSeriesRef.current?.update({
          time: chartTime,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
        volumeSeriesRef.current?.update({
          time: chartTime,
          value: candle.volume,
          color: candle.close >= candle.open ? UP_COLOR : DOWN_COLOR,
        });
      },
    );

    return unsub;
  }, [period, stockCode]);

  // 일/주/월/년봉 실시간 구독 (1day 토픽으로 통합)
  useEffect(() => {
    if (MINUTE_PERIODS.has(period) || !stockCode) return;

    const unsub = stompSubscribe(
      `/topic/stocks/${stockCode}/candle/1day`,
      (message) => {
        const daily: CandleData = JSON.parse(message.body);

        if (period === "day") {
          const chartTime = toChartTime(daily.time, false);
          candleSeriesRef.current?.update({
            time: chartTime,
            open: daily.open,
            high: daily.high,
            low: daily.low,
            close: daily.close,
          });
          volumeSeriesRef.current?.update({
            time: chartTime,
            value: daily.volume,
            color: daily.close >= daily.open ? UP_COLOR : DOWN_COLOR,
          });
          return;
        }

        // 주/월/년봉: 마지막 REST 봉에 오늘 일봉 데이터를 합산
        const base = lastRestCandleRef.current;
        if (!base) return;

        if (firstDailyVolumeRef.current === null) {
          firstDailyVolumeRef.current = daily.volume;
        }
        const volumeDelta = daily.volume - firstDailyVolumeRef.current;

        const chartTime = toChartTime(base.time, false);
        candleSeriesRef.current?.update({
          time: chartTime,
          open: base.open,
          high: Math.max(base.high, daily.high),
          low: Math.min(base.low, daily.low),
          close: daily.close,
        });
        volumeSeriesRef.current?.update({
          time: chartTime,
          value: base.volume + volumeDelta,
          color: daily.close >= base.open ? UP_COLOR : DOWN_COLOR,
        });
      },
    );

    return unsub;
  }, [period, stockCode]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 dark:bg-slate-900 dark:border-slate-900">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 pt-4 pb-3 gap-2">
        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-100">
          주가 차트
        </span>
        <div className="flex items-center gap-0.5">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              className={`whitespace-nowrap px-2 py-1 text-[11px] md:text-[12px] md:px-2.5 font-medium rounded-md transition-colors shrink-0 ${
                period === value
                  ? "text-[#0046FF] bg-blue-50 dark:bg-slate-700 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="relative h-[220px] md:h-[350px]">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10 rounded-b-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-[#0046FF] border-t-transparent animate-spin" />
          </div>
        )}

        {/* OHLCV 오버레이 */}
        {ohlcv && (
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2 overflow-x-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-2 py-1.5 text-[10px] md:text-[11px] md:gap-3 md:px-3 shadow-sm border border-gray-100 dark:border-slate-700 pointer-events-none">
            <span className="text-gray-400 dark:text-slate-500">시가</span>
            <span className={ohlcv.isUp ? "text-[#F04452]" : "text-[#3B7DEB]"}>
              {ohlcv.open.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-slate-500">고가</span>
            <span className="text-[#F04452]">
              {ohlcv.high.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-slate-500">저가</span>
            <span className="text-[#3B7DEB]">{ohlcv.low.toLocaleString()}</span>
            <span className="text-gray-400 dark:text-slate-500">종가</span>
            <span className={ohlcv.isUp ? "text-[#F04452]" : "text-[#3B7DEB]"}>
              {ohlcv.close.toLocaleString()}
            </span>
            <span className="text-gray-400 dark:text-slate-500">거래량</span>
            <span className="text-gray-700 dark:text-gray-300">{formatVolume(ohlcv.volume)}</span>
          </div>
        )}

        {/* 단일 차트 컨테이너 */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
