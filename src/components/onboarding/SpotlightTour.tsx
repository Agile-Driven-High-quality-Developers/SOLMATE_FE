import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";

// ─── 상수 ──────────────────────────────────────────────────────────────────────

const SPOT_PADDING = 10;
const TOOLTIP_GAP = 16;
const TOOLTIP_WIDTH = 280;

// ─── 타입 ──────────────────────────────────────────────────────────────────────

type Placement = "bottom" | "top" | "right" | "left";

export type TourItem =
  | string
  | { label: string; labelColor: string; text: string };

export type TourStep = {
  target: string;
  title: string;
  description: string;
  items?: TourItem[];
  placement: Placement;
};

type Props = {
  tourKey: string;
  steps: TourStep[];
};

// ─── 유틸 ──────────────────────────────────────────────────────────────────────

function getDisplayRect(rect: DOMRect): DOMRect {
  // 화면 아래로 삐져나가지 않도록 뷰포트 기준으로 높이 제한
  const maxHeight = window.innerHeight - rect.top - 20;
  const cappedHeight = Math.min(rect.height, Math.max(maxHeight, 80));
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: cappedHeight,
    top: rect.top,
    bottom: rect.top + cappedHeight,
    left: rect.left,
    right: rect.right,
    toJSON: rect.toJSON,
  };
}

function getTooltipPos(rect: DOMRect, placement: Placement): React.CSSProperties {
  const TOOLTIP_EST_HEIGHT = 320;
  const clampedLeft = Math.min(
    Math.max(16, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
    window.innerWidth - TOOLTIP_WIDTH - 16,
  );
  const vh = window.innerHeight;

  switch (placement) {
    case "bottom": {
      const spaceBelow = vh - rect.bottom - SPOT_PADDING - TOOLTIP_GAP;
      const spaceAbove = rect.top - SPOT_PADDING - TOOLTIP_GAP;
      // 아래 공간이 부족하면 위로 뒤집기
      if (spaceBelow < TOOLTIP_EST_HEIGHT && spaceAbove > spaceBelow) {
        return {
          top: Math.max(16, rect.top - SPOT_PADDING - TOOLTIP_GAP - TOOLTIP_EST_HEIGHT),
          left: clampedLeft,
        };
      }
      return {
        top: Math.min(rect.bottom + SPOT_PADDING + TOOLTIP_GAP, vh - TOOLTIP_EST_HEIGHT - 16),
        left: clampedLeft,
      };
    }
    case "top": {
      const spaceAbove = rect.top - SPOT_PADDING - TOOLTIP_GAP;
      const spaceBelow = vh - rect.bottom - SPOT_PADDING - TOOLTIP_GAP;
      // 위 공간이 부족하면 아래로 뒤집기
      if (spaceAbove < TOOLTIP_EST_HEIGHT && spaceBelow > spaceAbove) {
        return {
          top: Math.min(rect.bottom + SPOT_PADDING + TOOLTIP_GAP, vh - TOOLTIP_EST_HEIGHT - 16),
          left: clampedLeft,
        };
      }
      return {
        top: Math.max(16, rect.top - SPOT_PADDING - TOOLTIP_GAP - TOOLTIP_EST_HEIGHT),
        left: clampedLeft,
      };
    }
    case "right":
      return {
        top: Math.max(16, Math.min(rect.top + rect.height / 2 - 65, vh - TOOLTIP_EST_HEIGHT - 16)),
        left: Math.min(
          rect.right + SPOT_PADDING + TOOLTIP_GAP,
          window.innerWidth - TOOLTIP_WIDTH - 16,
        ),
      };
    case "left": {
      const rawLeft = rect.left - TOOLTIP_WIDTH - SPOT_PADDING - TOOLTIP_GAP;
      return {
        top: Math.max(16, Math.min(rect.top + rect.height / 2 - 65, vh - TOOLTIP_EST_HEIGHT - 16)),
        left: Math.max(16, rawLeft),
      };
    }
  }
}

// ─── SpotlightTour ─────────────────────────────────────────────────────────────

export default function SpotlightTour({ tourKey, steps }: Props) {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const seenTours = useOnboardingStore((s) => s.seenTours);
  const markTourSeen = useOnboardingStore((s) => s.markTourSeen);
  const resetTour = useOnboardingStore((s) => s.resetTour);

  const hasSeen = !hasSeenOnboarding || (seenTours[tourKey] ?? false);
  // 온보딩 완료 후 투어도 완료된 경우에만 재시작 버튼 표시
  const canReplay = hasSeenOnboarding && (seenTours[tourKey] ?? false);

  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const step = steps[stepIdx];
  const isFinal = stepIdx === steps.length - 1;

  useEffect(() => {
    if (hasSeen || !step) return;
    setTooltipVisible(false);

    const ids: ReturnType<typeof window.setTimeout>[] = [];

    ids.push(
      window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
        if (!el) {
          if (stepIdx < steps.length - 1) setStepIdx((s) => s + 1);
          else markTourSeen(tourKey);
          return;
        }

        el.scrollIntoView({ behavior: "smooth", block: "nearest" });

        ids.push(
          window.setTimeout(() => {
            const updated = document.querySelector<HTMLElement>(
              `[data-tour="${step.target}"]`,
            );
            if (updated) {
              setRect(updated.getBoundingClientRect());
              setTooltipVisible(true);
            }
          }, 350),
        );
      }, 0),
    );

    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [stepIdx, step?.target, hasSeen, tourKey, markTourSeen, steps.length]);

  useEffect(() => {
    if (hasSeen || !step) return;
    const updateRect = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    // 스크롤·리사이즈 시 하이라이트가 요소를 따라가도록 실시간 업데이트
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true); // capture: true로 내부 스크롤도 감지
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [step?.target, hasSeen]);

  const handleNext = () => {
    if (isFinal) {
      markTourSeen(tourKey);
    } else {
      setTooltipVisible(false);
      setTimeout(() => setStepIdx((s) => s + 1), 200);
    }
  };

  const handleReplay = () => {
    setStepIdx(0);
    setRect(null);
    setTooltipVisible(false);
    resetTour(tourKey);
  };

  if (hasSeen) {
    if (!canReplay) return null;
    return (
      <button
        className="animate-float fixed top-4 right-4 z-[999] w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-[#0046FF] hover:bg-gray-50 transition-colors"
        onClick={handleReplay}
        title="가이드 다시보기"
      >
        <HelpCircle size={22} />
      </button>
    );
  }

  if (!rect || !step) return null;

  const dr = getDisplayRect(rect);
  const sp = SPOT_PADDING;

  return (
    <>
      {/* ── 오버레이 + 하이라이트 홀 ── */}
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
                x={dr.x - sp}
                y={dr.y - sp}
                width={dr.width + sp * 2}
                height={dr.height + sp * 2}
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
        <div
          className="absolute rounded-xl"
          style={{
            top: dr.y - sp,
            left: dr.x - sp,
            width: dr.width + sp * 2,
            height: dr.height + sp * 2,
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
          ...getTooltipPos(dr, step.placement),
          opacity: tooltipVisible ? 1 : 0,
          transform: tooltipVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: tooltipVisible ? "auto" : "none",
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 진행 바 */}
          <div className="flex h-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className="flex-1 transition-colors duration-300"
                style={{ backgroundColor: i <= stepIdx ? "#0046FF" : "#E5E7EB" }}
              />
            ))}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#0046FF] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {stepIdx + 1} / {steps.length}
              </span>
              <button
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => markTourSeen(tourKey)}
              >
                건너뛰기
              </button>
            </div>

            <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">
              {step.title}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-2">
              {step.description}
            </p>
            {step.items && (
              <ul className="mb-2 flex flex-col gap-1.5">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#0046FF] inline-block" />
                    <span className="leading-snug">
                      {typeof item === "string" ? item : (
                        <>
                          <span className="font-semibold" style={{ color: item.labelColor }}>{item.label}</span>
                          {" "}{item.text}
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="w-full py-2.5 bg-[#0046FF] text-white text-sm font-medium rounded-[8px] hover:bg-[#0038CC] transition-colors"
              onClick={handleNext}
            >
              {isFinal ? "확인" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
