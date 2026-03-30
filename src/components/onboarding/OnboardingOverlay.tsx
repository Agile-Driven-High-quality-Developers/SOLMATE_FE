import { useState } from "react";
import { Hand, Wallet, BarChart2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";

type Slide = {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  highlight?: string;
};

const SLIDES: Slide[] = [
  {
    icon: Hand,
    badge: "환영해요",
    title: "Solmate에 오신 걸\n환영해요!",
    description:
      "가상 1,000만원으로 실전 같은 주식 투자를\n경험할 수 있는 모의투자 플랫폼이에요.",
    highlight: "실제 코스피200 시세 그대로, 리스크 없이 시작",
  },
  {
    icon: Wallet,
    badge: "내 자산",
    title: "예수금·평가자산을\n한눈에 확인해요",
    description:
      "홈에서 총 평가자산과 예수금을 볼 수 있어요.\n예수금은 아직 투자하지 않은 내 현금이에요.",
    highlight: "평가자산 = 예수금 + 보유 종목 평가금액",
  },
  {
    icon: BarChart2,
    badge: "매수 · 매도",
    title: "종목을 골라\n매수·매도 해봐요",
    description:
      "모의투자 탭에서 종목을 검색하고\n매수(사기)·매도(팔기)를 직접 해볼 수 있어요.",
    highlight: "등락률 빨강 = 오름 / 파랑 = 내림 (한국 증시)",
  },
  {
    icon: Trophy,
    badge: "랭킹 · 멘토",
    title: "TOP 투자자와\n함께 성장해요",
    description:
      "수익률 상위 투자자의 포트폴리오를 보고 배우거나,\n멘토를 찾아 조언을 구할 수 있어요.",
  },
];

export default function OnboardingOverlay() {
  const markAsSeen = useOnboardingStore((s) => s.markAsSeen);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const slide = SLIDES[step];
  const isFinal = step === SLIDES.length - 1;

  const transition = (toStep: number) => {
    setVisible(false);
    setTimeout(() => {
      setStep(toStep);
      setVisible(true);
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white px-6 py-10">
      {/* 상단: 건너뛰기 */}
      <div className="w-full flex justify-end">
        <button
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          onClick={markAsSeen}
        >
          건너뛰기
        </button>
      </div>

      {/* 중앙: 슬라이드 콘텐츠 */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full transition-all duration-150"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {/* 아이콘 원형 */}
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-[#0046FF] mb-6">
          <slide.icon size={44} />
        </div>

        {/* 뱃지 */}
        <span className="text-xs font-semibold text-[#0046FF] bg-blue-50 px-3 py-1 rounded-full mb-4">
          {slide.badge}
        </span>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 whitespace-pre-line leading-snug mb-3">
          {slide.title}
        </h2>

        {/* 설명 */}
        <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">
          {slide.description}
        </p>

        {/* 하이라이트 박스 */}
        {slide.highlight && (
          <div className="w-full mt-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-sm text-[#0046FF] font-medium">
              {slide.highlight}
            </p>
          </div>
        )}
      </div>

      {/* 하단: 도트 + 버튼 */}
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* 진행 도트 */}
        <div className="flex justify-center items-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === step ? "24px" : "8px",
                backgroundColor: i === step ? "#0046FF" : "#E5E7EB",
              }}
            />
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              className="flex-1 py-3 rounded-[10px] border border-[#0046FF] text-[#0046FF] text-sm font-medium hover:bg-blue-50 transition-colors"
              onClick={() => transition(step - 1)}
            >
              이전
            </button>
          )}
          <button
            className="flex-1 py-3 rounded-[10px] bg-[#0046FF] text-white text-sm font-medium hover:bg-[#0038CC] transition-colors"
            onClick={() => (isFinal ? markAsSeen() : transition(step + 1))}
          >
            {isFinal ? "앱 기능 둘러보기 →" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
