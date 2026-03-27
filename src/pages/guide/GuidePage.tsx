import { useRef, useState, useEffect } from "react";
import {
  BookOpen,
  TrendingUp,
  BarChart2,
  Users,
  Wallet,
  BookMarked,
  Info,
  Lightbulb,
  Target,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";

// ─── 섹션 정의 ───────────────────────────────────────────────
const SECTIONS = [
  { id: "intro", label: "서비스 소개", icon: Info },
  { id: "usage", label: "사용 가이드", icon: BookMarked },
  { id: "invest", label: "주식투자 가이드", icon: TrendingUp },
  { id: "terms", label: "주식 용어 사전", icon: HelpCircle },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ─── 주식 용어 데이터 ────────────────────────────────────────
const STOCK_TERMS = [
  {
    term: "주식 (Stock)",
    desc: "기업의 소유권을 나타내는 증서. 주식을 보유하면 해당 기업의 주주가 됩니다.",
    icon: "📄",
  },
  {
    term: "시가총액 (Market Cap)",
    desc: "현재 주가 × 발행 주식 수로 계산한 기업의 총 시장 가치입니다.",
    icon: "💰",
  },
  {
    term: "KOSPI",
    desc: "한국종합주가지수. 유가증권시장에 상장된 모든 종목의 시가총액을 기준으로 산출합니다.",
    icon: "📊",
  },
  {
    term: "KOSDAQ",
    desc: "코스닥 지수. 주로 IT·바이오 등 성장 기업이 상장된 시장의 주가지수입니다.",
    icon: "📈",
  },
  {
    term: "PER (주가수익비율)",
    desc: "주가 ÷ EPS(주당순이익). 주식이 수익 대비 얼마나 비싼지를 나타내는 지표입니다.",
    icon: "🔢",
  },
  {
    term: "PBR (주가순자산비율)",
    desc: "주가 ÷ BPS(주당순자산). 기업의 순자산 대비 주가 수준을 나타냅니다.",
    icon: "📐",
  },
  {
    term: "배당금 (Dividend)",
    desc: "기업이 이익의 일부를 주주에게 나눠주는 금액. 현금 또는 주식 형태로 지급됩니다.",
    icon: "🎁",
  },
  {
    term: "호가 (Quote)",
    desc: "매수자와 매도자가 제시하는 가격. 매수호가(Bid)와 매도호가(Ask)로 구분됩니다.",
    icon: "💬",
  },
  {
    term: "거래량 (Volume)",
    desc: "특정 기간 동안 거래된 주식의 수량. 시장 관심도와 유동성을 나타냅니다.",
    icon: "🔊",
  },
  {
    term: "RSI (상대강도지수)",
    desc: "0~100 사이 값으로 주식의 과매수·과매도 상태를 측정하는 기술적 지표입니다.",
    icon: "⚡",
  },
  {
    term: "이동평균선 (MA)",
    desc: "일정 기간의 종가 평균을 연결한 선. 5일·20일·60일선이 자주 사용됩니다.",
    icon: "〰️",
  },
  {
    term: "수익률 (Return Rate)",
    desc: "(현재가 - 매수가) ÷ 매수가 × 100. 투자 성과를 퍼센트로 나타냅니다.",
    icon: "📉",
  },
];

// ─── 투자 전략 카드 데이터 ────────────────────────────────────
const INVEST_STRATEGIES = [
  {
    title: "분산 투자",
    desc: "여러 종목·섹터에 나눠 투자해 특정 종목 하락의 위험을 줄이세요.",
    icon: PieChart,
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    title: "장기 투자",
    desc: "단기 변동보다 장기적 성장 가능성을 보고 투자하는 전략입니다.",
    icon: Target,
    color: "bg-purple-50 text-purple-600",
    borderColor: "border-purple-100",
  },
  {
    title: "가치 투자",
    desc: "내재가치 대비 저평가된 종목을 발굴해 장기 보유하는 방식입니다.",
    icon: Shield,
    color: "bg-green-50 text-green-600",
    borderColor: "border-green-100",
  },
  {
    title: "기술적 분석",
    desc: "차트 패턴과 거래량 등 과거 데이터로 미래 가격을 예측합니다.",
    icon: Activity,
    color: "bg-orange-50 text-orange-600",
    borderColor: "border-orange-100",
  },
];

// ─── 사용 가이드 스텝 데이터 ─────────────────────────────────
const USAGE_STEPS = [
  {
    step: "01",
    title: "계좌 확인",
    desc: "왼쪽 메뉴의 '내 계좌'에서 나의 가상 자산과 보유 종목 현황을 확인하세요.",
    icon: Wallet,
    color: "bg-blue-500",
  },
  {
    step: "02",
    title: "종목 탐색",
    desc: "'모의투자' 메뉴에서 실시간 시세와 차트를 보며 투자할 종목을 탐색하세요.",
    icon: BarChart2,
    color: "bg-indigo-500",
  },
  {
    step: "03",
    title: "주문 실행",
    desc: "종목 상세 페이지에서 매수·매도 주문을 내고 포트폴리오를 구성하세요.",
    icon: TrendingUp,
    color: "bg-violet-500",
  },
  {
    step: "04",
    title: "매매일지 작성",
    desc: "거래 후 '매매일지'에 투자 근거와 결과를 기록하며 실력을 키우세요.",
    icon: BookOpen,
    color: "bg-purple-500",
  },
  {
    step: "05",
    title: "유저 교류",
    desc: "'유저 목록'에서 다른 투자자를 탐색하고 멘토·멘티 관계를 맺어보세요.",
    icon: Users,
    color: "bg-pink-500",
  },
];

// ─── 서비스 기능 카드 데이터 ─────────────────────────────────
const SERVICE_FEATURES = [
  {
    title: "모의투자",
    desc: "실제 주식 시세와 동일한 환경에서 가상 자금으로 주식 매매를 경험하세요.",
    icon: BarChart2,
    badge: "실시간",
    badgeColor: "bg-blue-100 text-blue-700",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "포트폴리오 분석",
    desc: "보유 종목의 수익률, 비중, 손익 현황을 한눈에 파악할 수 있습니다.",
    icon: PieChart,
    badge: "자산관리",
    badgeColor: "bg-violet-100 text-violet-700",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    title: "매매일지",
    desc: "거래 내역을 기록하고 자신의 투자 패턴을 분석하며 성장하세요.",
    icon: BookOpen,
    badge: "학습",
    badgeColor: "bg-green-100 text-green-700",
    gradient: "from-green-500 to-green-600",
  },
  {
    title: "멘토링",
    desc: "경험 많은 투자자를 멘토로 등록하고 투자 노하우를 배워보세요.",
    icon: Star,
    badge: "소셜",
    badgeColor: "bg-orange-100 text-orange-700",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "랭킹",
    desc: "다른 유저와 수익률을 비교하고 상위권을 목표로 동기를 유지하세요.",
    icon: Layers,
    badge: "경쟁",
    badgeColor: "bg-red-100 text-red-700",
    gradient: "from-red-500 to-red-600",
  },
  {
    title: "실시간 시세",
    desc: "KOSPI·KOSDAQ 지수와 종목별 실시간 주가 정보를 제공합니다.",
    icon: Activity,
    badge: "마켓",
    badgeColor: "bg-teal-100 text-teal-700",
    gradient: "from-teal-500 to-teal-600",
  },
];

// ─── 투자 원칙 카드 ──────────────────────────────────────────
const INVEST_RULES = [
  {
    icon: "✅",
    title: "매수 및 매도 기준 설정",
    desc: "매수 전 손실 허용 범위(-5% ~ -10%)를 미리 정하고 감정 없이 실행하세요.",
  },
  {
    icon: "✅",
    title: "분할 매수",
    desc: "한 번에 전량 매수하지 말고 여러 번에 나눠 평균 단가를 낮추세요.",
  },
  {
    icon: "✅",
    title: "기업 분석 우선",
    desc: "차트만 보지 말고 재무제표, 사업 모델, 성장성을 함께 파악하세요.",
  },
  {
    icon: "⚠️",
    title: "단일 종목 투자 금지",
    desc: "단일 종목에 전 자산을 투자하면 리스크가 극단적으로 커집니다.",
  },
  {
    icon: "⚠️",
    title: "뇌동매매 주의",
    desc: "SNS·커뮤니티 소문에 충동적으로 매매하면 손실 확률이 높아집니다.",
  },
  {
    icon: "⚠️",
    title: "빚 투자 금지",
    desc: "대출을 이용한 투자(레버리지)는 손실 시 원금 이상 잃을 수 있습니다.",
  },
];

const NAV_HEIGHT = 49; // py-3.5(28px) + 텍스트(21px)

// ─── 컴포넌트 ────────────────────────────────────────────────
export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // 스크롤 감지 → 활성 섹션 업데이트
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      let current: SectionId = "intro";

      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (!el) continue;
        // el.offsetTop은 패딩 포함 컨테이너 내부 기준
        // scrollTop + NAV_HEIGHT + 여유(32) 이상이면 활성
        const elScrollTop = el.offsetTop - container.scrollTop;
        if (elScrollTop <= NAV_HEIGHT + 32) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: SectionId) => {
    const el = sectionRefs.current[id];
    const container = contentRef.current;
    if (!el || !container) return;

    // 탭바(NAV_HEIGHT) + 여유 24px 아래에 섹션 상단이 오도록
    container.scrollTo({
      top: el.offsetTop - NAV_HEIGHT - 24,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50">
      {/* ── 상단 내비게이션 탭 (콘텐츠 위에 절대 위치) ────── */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/60 backdrop-blur-lg border-b border-white/40 px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={[
                  "flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all duration-150 cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-[#0046FF] text-[#0046FF]"
                    : "border-transparent text-gray-400 hover:text-gray-700",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span
                  className={[
                    "text-[13px]",
                    isActive ? "font-semibold" : "font-medium",
                  ].join(" ")}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 메인 콘텐츠 (탭바 뒤로 스크롤됨) ──────────────── */}
      <div
        ref={contentRef}
        className="h-full overflow-y-auto px-8 pb-8"
        style={{ paddingTop: NAV_HEIGHT + 32 }}
      >
        <div className="max-w-3xl mx-auto space-y-16">
          {/* ══ 1. 서비스 소개 ══════════════════════════════ */}
          <section
            ref={(el) => {
              sectionRefs.current["intro"] = el;
            }}
            id="intro"
          >
            {/* 히어로 배너 */}
            <div
              className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #1437C8 0%, #0046FF 60%, #3B6FFF 100%)",
              }}
            >
              <div className="relative z-10">
                <span className="inline-block text-[12px] font-semibold bg-white/20 px-3 py-1 rounded-full mb-3">
                  SOLMate 가이드
                </span>
                <h1 className="text-2xl font-bold mb-2">
                  SOLMate와 함께
                  <br />
                  주식투자를 배워보세요
                </h1>
                <p className="text-blue-100 text-[14px] leading-relaxed">
                  실제 시세를 기반으로 한 모의투자 플랫폼에서
                  <br />
                  안전하게 투자를 연습하고 실력을 키우세요.
                </p>
              </div>
              {/* 배경 장식 */}
              <div className="absolute right-6 top-6 w-24 h-24 rounded-full bg-white/5 border border-white/10" />
              <div className="absolute right-12 bottom-4 w-16 h-16 rounded-full bg-white/5 border border-white/10" />
            </div>

            <SectionHeader
              icon={Info}
              label="서비스 소개"
              title="SOLMate는 어떤 서비스인가요?"
            />

            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              SOLMate는 실제 주식 시세를 기반으로 한{" "}
              <strong className="text-gray-800">모의투자 학습 플랫폼</strong>
              입니다. 가상 자금으로 주식을 매매하며 투자 실력을 키우고, 다른
              투자자와 함께 성장할 수 있습니다.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {SERVICE_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${feat.badgeColor}`}
                      >
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold text-gray-800 mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══ 2. 사용 가이드 ══════════════════════════════ */}
          <section
            ref={(el) => {
              sectionRefs.current["usage"] = el;
            }}
            id="usage"
          >
            <SectionHeader
              icon={BookMarked}
              label="사용 가이드"
              title="SOLMate 이렇게 사용하세요"
            />

            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              아래 5단계를 따라 SOLMate의 핵심 기능을 경험해보세요. 순서대로
              따라하면 투자 실력을 빠르게 키울 수 있습니다.
            </p>

            <div className="space-y-4">
              {USAGE_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    {/* 스텝 번호 + 연결선 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-xl ${step.color} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      {i < USAGE_STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 mt-2" />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-gray-300">
                          STEP {step.step}
                        </span>
                        <h3 className="text-[14px] font-semibold text-gray-800">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[13px] text-gray-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 팁 박스 */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-amber-800 mb-1">
                  초보자 팁
                </p>
                <p className="text-[13px] text-amber-700 leading-relaxed">
                  처음에는 관심 있는 기업 2~3개를 골라 소액으로 시작해보세요.
                  매매일지를 꾸준히 작성하면 자신의 투자 패턴을 파악하는 데 큰
                  도움이 됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* ══ 3. 주식투자 가이드 ══════════════════════════ */}
          <section
            ref={(el) => {
              sectionRefs.current["invest"] = el;
            }}
            id="invest"
          >
            <SectionHeader
              icon={TrendingUp}
              label="주식투자 가이드"
              title="주식투자, 어떻게 시작할까요?"
            />

            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              주식투자는 기업의 성장에 함께 참여하는 행위입니다. 올바른 전략과
              원칙을 갖추면 안정적으로 자산을 늘릴 수 있습니다.
            </p>

            {/* 수익/손실 예시 카드 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-[13px] font-semibold text-red-600">
                    수익 예시
                  </span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  1주 @ 50,000원 매수 →<br />
                  1주 @ 60,000원 매도
                  <br />
                  <strong className="text-red-600">
                    +10,000원 (+20%) 수익
                  </strong>
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-blue-500" />
                  <span className="text-[13px] font-semibold text-blue-600">
                    손실 예시
                  </span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  1주 @ 50,000원 매수 →<br />
                  1주 @ 42,000원 매도
                  <br />
                  <strong className="text-blue-600">
                    -8,000원 (-16%) 손실
                  </strong>
                </p>
              </div>
            </div>

            {/* 투자 전략 */}
            <h3 className="text-[15px] font-semibold text-gray-800 mb-3">
              대표적인 투자 전략
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {INVEST_STRATEGIES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className={`bg-white rounded-2xl p-4 border ${s.borderColor} hover:shadow-sm transition-all`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center mb-2.5`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-[13px] font-semibold text-gray-800 mb-1">
                      {s.title}
                    </h4>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 투자 원칙 */}
            <h3 className="text-[15px] font-semibold text-gray-800 mb-3">
              투자 원칙 & 주의사항
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {INVEST_RULES.map((rule, i) => (
                <div
                  key={rule.title}
                  className={[
                    "flex items-start gap-3 px-5 py-4",
                    i < INVEST_RULES.length - 1
                      ? "border-b border-gray-50"
                      : "",
                  ].join(" ")}
                >
                  <span className="text-lg shrink-0">{rule.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 mb-0.5">
                      {rule.title}
                    </p>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 수수료 안내 */}
            <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">
                  수수료 안내
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  SOLMate 모의투자는 매매 시 수수료가 별도로 부과되지 않습니다.
                  실전 투자에는 수수료가 부과되므로 수수료가 수익에 미치는
                  영향을 미리 파악해두세요.
                </p>
              </div>
            </div>
          </section>

          {/* ══ 4. 주식 용어 사전 ══════════════════════════ */}
          <section
            ref={(el) => {
              sectionRefs.current["terms"] = el;
            }}
            id="terms"
            className="pb-16"
          >
            <SectionHeader
              icon={HelpCircle}
              label="주식 용어 사전"
              title="꼭 알아야 할 주식 용어"
            />

            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              주식 투자에 자주 등장하는 핵심 용어를 정리했습니다. 용어를
              이해하면 시장을 더 명확하게 읽을 수 있습니다.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {STOCK_TERMS.map((item) => (
                <div
                  key={item.term}
                  className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800 mb-0.5">
                      {item.term}
                    </p>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 마무리 배너 */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
              <p className="text-[16px] font-bold mb-1">이제 준비됐나요?</p>
              <p className="text-blue-100 text-[13px] mb-4">
                SOLMate와 함께 모의투자를 시작해보세요!
              </p>
              <a
                href="/invest"
                className="inline-flex items-center gap-1.5 bg-white text-blue-600 text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                모의투자 시작하기
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── 섹션 헤더 공통 컴포넌트 ─────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  title,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-[#0046FF]" />
        <span className="text-[12px] font-semibold text-[#0046FF] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <h2 className="text-[20px] font-bold text-gray-900">{title}</h2>
      <div className="mt-2 w-10 h-0.5 bg-[#0046FF] rounded-full" />
    </div>
  );
}
