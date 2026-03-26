import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboardingStore";

// ─── 상수 ──────────────────────────────────────────────────────────────────────

const SPOT_PADDING = 10; // 하이라이트 요소 주변 여백
const TOOLTIP_GAP = 16;  // 스팟라이트 ~ 툴팁 사이 간격
const TOOLTIP_WIDTH = 280;

// ─── 스텝 정의 ─────────────────────────────────────────────────────────────────

type Placement = "bottom" | "top" | "right";

type Step = {
  target: string;
  title: string;
  description: string;
  placement: Placement;
};

const STEPS: Step[] = [
  {
    target: "market-indices",
    title: "시장 지수",
    description: "코스피·코스닥·환율이 오늘 얼마나 움직였는지 실시간으로 보여줘요.",
    placement: "bottom",
  },
  {
    target: "portfolio",
    title: "내 자산",
    description: "가상 자금으로 얼마나 수익을 냈는지 한 눈에 확인할 수 있어요.",
    placement: "bottom",
  },
  {
    target: "holdings",
    title: "보유 종목",
    description: "내가 매수한 주식들의 현황이 여기에 표시돼요.",
    placement: "top",
  },
  {
    target: "nav-invest",
    title: "모의투자",
    description: "원하는 주식을 검색하고 매수·매도할 수 있어요. 지금 바로 눌러봐요!",
    placement: "right",
  },
];

// ─── 툴팁 위치 계산 ────────────────────────────────────────────────────────────

function getTooltipPos(rect: DOMRect, placement: Placement): React.CSSProperties {
  const clampedLeft = Math.min(
    Math.max(16, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
    window.innerWidth - TOOLTIP_WIDTH - 16,
  );

  switch (placement) {
    case "bottom":
      return {
        top: rect.bottom + SPOT_PADDING + TOOLTIP_GAP,
        left: clampedLeft,
      };
    case "top":
      // bottom 기준: 뷰포트 하단 → rect.top 위로
      return {
        bottom: window.innerHeight - rect.top + SPOT_PADDING + TOOLTIP_GAP,
        left: clampedLeft,
      };
    case "right":
      return {
        top: Math.max(16, rect.top + rect.height / 2 - 65),
        left: rect.right + SPOT_PADDING + TOOLTIP_GAP,
      };
  }
}

// ─── SpotlightTour ─────────────────────────────────────────────────────────────

export default function SpotlightTour() {
  const markSpotlightSeen = useOnboardingStore((s) => s.markSpotlightSeen);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const step = STEPS[stepIdx];
  const isFinal = stepIdx === STEPS.length - 1;

  useEffect(() => {
    setTooltipVisible(false);

    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      // 요소를 찾지 못하면 다음 스텝으로
      if (stepIdx < STEPS.length - 1) setStepIdx((s) => s + 1);
      else markSpotlightSeen();
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const id = window.setTimeout(() => {
      const updated = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (updated) {
        setRect(updated.getBoundingClientRect());
        setTooltipVisible(true);
      }
    }, 350);

    return () => window.clearTimeout(id);
  }, [stepIdx, step.target, markSpotlightSeen]);

  // 리사이즈 시 rect 재계산
  useEffect(() => {
    const onResize = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step.target]);

  const handleNext = () => {
    if (isFinal) {
      markSpotlightSeen();
    } else {
      setTooltipVisible(false);
      setTimeout(() => setStepIdx((s) => s + 1), 200);
    }
  };

  if (!rect) return null;

  const sp = SPOT_PADDING;

  return (
    <>
      {/* ── 어두운 오버레이 + 하이라이트 홀 (SVG 마스크) ── */}
      <div className="fixed inset-0" style={{ zIndex: 51, pointerEvents: "none" }}>
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ display: "block" }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.x - sp}
                y={rect.y - sp}
                width={rect.width + sp * 2}
                height={rect.height + sp * 2}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* 파란 테두리 링 */}
        <div
          className="absolute rounded-xl"
          style={{
            top: rect.y - sp,
            left: rect.x - sp,
            width: rect.width + sp * 2,
            height: rect.height + sp * 2,
            border: "2px solid #0046FF",
            boxShadow: "0 0 0 3px rgba(0,70,255,0.15)",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* ── 툴팁 ── */}
      <div
        className="fixed w-[280px] z-[52]"
        style={{
          ...getTooltipPos(rect, step.placement),
          opacity: tooltipVisible ? 1 : 0,
          transform: tooltipVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: tooltipVisible ? "auto" : "none",
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 상단 진행 바 */}
          <div className="flex h-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="flex-1 transition-colors duration-300"
                style={{ backgroundColor: i <= stepIdx ? "#0046FF" : "#E5E7EB" }}
              />
            ))}
          </div>

          <div className="p-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#0046FF] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {stepIdx + 1} / {STEPS.length}
              </span>
              <button
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                onClick={markSpotlightSeen}
              >
                건너뛰기
              </button>
            </div>

            {/* 내용 */}
            <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{step.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* 버튼 */}
            <button
              className="w-full py-2.5 bg-[#0046FF] text-white text-sm font-medium rounded-[8px] hover:bg-[#0038CC] transition-colors"
              onClick={handleNext}
            >
              {isFinal ? "둘러보기 완료" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
