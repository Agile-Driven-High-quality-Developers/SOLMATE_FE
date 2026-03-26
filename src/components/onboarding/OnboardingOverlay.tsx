import { useState } from "react";
import { useOnboardingStore } from "@/store/onboardingStore";

type Slide = {
  emoji: string;
  badge: string;
  title: string;
  description: string;
  highlight?: string;
};

const SLIDES: Slide[] = [
  {
    emoji: "👋",
    badge: "환영해요",
    title: "솔메이트에 오신 걸\n환영해요!",
    description: "실제 돈 없이 주식 투자를 경험할 수 있는\n모의투자 플랫폼이에요.",
    highlight: "1,000만원의 가상 자금으로 지금 바로 시작할 수 있어요",
  },
  {
    emoji: "📈",
    badge: "주식",
    title: "주식이 뭔가요?",
    description: "회사의 일부를 소유하는 증서예요.\n회사가 성장하면 주식 가격도 함께 올라가요.",
    highlight: "주식을 사는 걸 '매수', 파는 걸 '매도'라고 해요",
  },
  {
    emoji: "💰",
    badge: "시세 · 수익률",
    title: "시세와 수익률이\n뭔가요?",
    description:
      "시세는 지금 실시간으로 거래되는 가격이에요.\n수익률은 내가 산 가격 대비 얼마나 올랐는지예요.",
    highlight: "예) 10,000원에 샀는데 11,000원이면 수익률 +10% 📈",
  },
  {
    emoji: "🚀",
    badge: "시작!",
    title: "준비 완료!\n이제 시작해볼까요?",
    description: "투자 탭에서 마음에 드는 주식을 골라\n나만의 포트폴리오를 만들어봐요.",
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
        {/* 이모지 원형 */}
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-5xl mb-6">
          {slide.emoji}
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
            <p className="text-sm text-[#0046FF] font-medium">{slide.highlight}</p>
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
            {isFinal ? "투자 시작하기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
