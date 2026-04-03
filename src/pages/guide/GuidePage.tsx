import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
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
  PieChart,
  Activity,
  Layers,
  HelpCircle,
  FileText,
  Hash,
  Ruler,
  Gift,
  MessageCircle,
  Volume2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
} from "lucide-react";

// ─── 섹션 정의 ───────────────────────────────────────────────
const SECTIONS = [
  { id: "intro", label: "서비스 소개", icon: Info },
  { id: "usage", label: "사용 가이드", icon: BookMarked },
  { id: "market", label: "거래 시간", icon: Clock },
  { id: "invest", label: "주식투자 가이드", icon: TrendingUp },
  { id: "terms", label: "주식 용어 사전", icon: HelpCircle },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ─── 주식 용어 데이터 ────────────────────────────────────────
const STOCK_TERMS = [
  {
    term: "주식 (Stock)",
    desc: "기업의 소유권을 나타내는 증서. 주식을 보유하면 해당 기업의 주주가 됩니다.",
    icon: FileText,
  },
  {
    term: "시가총액 (Market Cap)",
    desc: "현재 주가 × 발행 주식 수로 계산한 기업의 총 시장 가치입니다.",
    icon: Wallet,
  },
  {
    term: "KOSPI",
    desc: "한국종합주가지수. 유가증권시장에 상장된 모든 종목의 시가총액을 기준으로 산출합니다.",
    icon: BarChart2,
  },
  {
    term: "KOSDAQ",
    desc: "코스닥 지수. 주로 IT·바이오 등 성장 기업이 상장된 시장의 주가지수입니다.",
    icon: TrendingUp,
  },
  {
    term: "PER (주가수익비율)",
    desc: "주가 ÷ EPS(주당순이익). 주식이 수익 대비 얼마나 비싼지를 나타내는 지표입니다.",
    icon: Hash,
  },
  {
    term: "PBR (주가순자산비율)",
    desc: "주가 ÷ BPS(주당순자산). 기업의 순자산 대비 주가 수준을 나타냅니다.",
    icon: Ruler,
  },
  {
    term: "배당금 (Dividend)",
    desc: "기업이 이익의 일부를 주주에게 나눠주는 금액. 현금 또는 주식 형태로 지급됩니다.",
    icon: Gift,
  },
  {
    term: "호가 (Quote)",
    desc: "매수자와 매도자가 제시하는 가격. 매수호가(Bid)와 매도호가(Ask)로 구분됩니다.",
    icon: MessageCircle,
  },
  {
    term: "거래량 (Volume)",
    desc: "특정 기간 동안 거래된 주식의 수량. 시장 관심도와 유동성을 나타냅니다.",
    icon: Volume2,
  },
  {
    term: "RSI (상대강도지수)",
    desc: "0~100 사이 값으로 주식의 과매수·과매도 상태를 측정하는 기술적 지표입니다.",
    icon: Zap,
  },
  {
    term: "이동평균선 (MA)",
    desc: "일정 기간의 종가 평균을 연결한 선. 5일·20일·60일선이 자주 사용됩니다.",
    icon: Activity,
  },
  {
    term: "수익률 (Return Rate)",
    desc: "(현재가 - 매수가) ÷ 매수가 × 100. 투자 성과를 퍼센트로 나타냅니다.",
    icon: TrendingDown,
  },
];

// ─── 투자 전략 카드 데이터 ────────────────────────────────────
const INVEST_STRATEGIES = [
  {
    title: "분산 투자",
    desc: "여러 종목과 산업에 나눠 투자해 특정 종목 하락에 따른 위험을 줄이는 전략입니다.",
    icon: PieChart,
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    title: "장기 투자",
    desc: "단기적인 가격 변동보다 장기적인 성장 가능성을 보고 투자하는 전략입니다.",
    icon: Target,
    color: "bg-purple-50 text-purple-600",
    borderColor: "border-purple-100",
  },
  {
    title: "가치 투자",
    desc: "기업의 내재가치 대비 저평가된 종목을 찾아 장기 보유하는 투자 방식입니다.",
    icon: Shield,
    color: "bg-green-50 text-green-600",
    borderColor: "border-green-100",
  },
  {
    title: "기술적 분석",
    desc: "차트와 거래량을 보고 앞으로의 가격 흐름을 살펴보는 분석 방법입니다.",
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
    desc: "매매일지에 투자 근거와 결과를 기록하며 실력을 키우세요.",
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
    desc: "다른 유저와 수익률을 비교하고 상위권에 도전해보세요.",
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
    icon: CheckCircle2,
    iconColor: "text-green-500",
    title: "매수 및 매도 기준 세우기",
    desc: "매매 전에 손실 허용 범위를 미리 정해두면 감정적인 판단을 줄이는 데 도움이 됩니다.",
  },
  {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    title: "분할 매수",
    desc: "한 번에 모두 매수하기보다 여러 번 나눠 매수하면 평균 매입 단가를 조절하는 데 도움이 될 수 있습니다.",
  },
  {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    title: "기업 분석 함께 보기",
    desc: "차트뿐 아니라 재무지표, 사업 모델, 성장 가능성도 함께 살펴보는 것이 좋습니다.",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    title: "단일 종목 투자 주의",
    desc: "한 종목에 자산이 집중되면 가격 변동에 따른 위험이 커질 수 있습니다.",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    title: "소문에 따른 매매 주의",
    desc: "SNS나 커뮤니티 정보만 믿고 성급하게 매매하면 예상과 다른 결과가 날 수 있습니다.",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    title: "빚을 이용한 투자 주의",
    desc: "대출을 활용한 투자에는 손실이 커질 수 있는 위험이 있습니다.",
  },
];

// ─── 거래 시간 데이터 ────────────────────────────────────────
const KRX_SESSIONS = [
  {
    name: "장개시전 시간외종가",
    time: "08:30 ~ 08:40",
    desc: "전날 정규장 종가로 매매가 이루어집니다. 가격이 종가로 고정되어 있어 먼저 주문할수록 빨리 체결됩니다.",
    tag: "시간외종가",
    dot: "bg-gray-300",
    color: "bg-gray-100 text-gray-500",
  },
  {
    name: "장전 동시호가",
    time: "08:30 접수 → 09:00 체결",
    desc: "08:30부터 주문 접수가 가능하며, 09:00에 단일가로 일괄 체결하여 시가를 결정합니다.",
    tag: "단일가",
    dot: "bg-blue-300",
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "정규장",
    time: "09:00 ~ 15:30",
    desc: "매수·매도 주문이 실시간 접속매매로 체결됩니다. 시가·종가는 단일가매매로 결정됩니다.",
    tag: "접속매매",
    dot: "bg-blue-500",
    color: "bg-green-50 text-green-600",
  },
  {
    name: "장종료후 시간외종가",
    time: "15:40 ~ 16:00",
    desc: "당일 종가로 매매됩니다. 가격이 종가로 고정되어 먼저 주문할수록 빨리 체결됩니다. 주문 접수는 15:30부터 가능하며, 체결은 15:40부터 시작됩니다.",
    tag: "시간외종가",
    dot: "bg-gray-300",
    color: "bg-gray-100 text-gray-500",
  },
  {
    name: "시간외 단일가",
    time: "16:00 ~ 18:00",
    desc: "종가 대비 ±10% 범위 내에서 원하는 가격으로 주문할 수 있으며, 10분마다 모인 주문을 한꺼번에 체결합니다. 이 시간대 거래는 정규장 주가에 영향을 미치지 않습니다.",
    tag: "단일가",
    dot: "bg-gray-300",
    color: "bg-gray-100 text-gray-500",
  },
];

const NXT_SESSIONS = [
  {
    name: "프리마켓 (Pre)",
    time: "08:00 ~ 08:50",
    desc: "정규장 시작 전 거래 시간입니다. 지정가·최유리지정가·최우선지정가 주문이 가능합니다.",
    tag: "단일가",
    dot: "bg-orange-300",
    color: "bg-orange-50 text-orange-600",
  },
  {
    name: "정규장 (Main)",
    time: "09:00 ~ 15:20",
    desc: "KRX 정규장 개시 직후 시작하며, 접속매매로 실시간 체결됩니다. 조건부지정가를 제외한 모든 호가 유형이 가능합니다.",
    tag: "접속매매",
    dot: "bg-orange-500",
    color: "bg-green-50 text-green-600",
  },
  {
    name: "종가매매",
    time: "15:30 ~ 16:00",
    desc: "KRX 당일 종가로 체결됩니다. 호가 접수는 15:00부터 가능하며, 매매 체결은 15:30~16:00에 이루어집니다.",
    tag: "종가",
    dot: "bg-orange-200",
    color: "bg-orange-50 text-orange-500",
  },
  {
    name: "애프터마켓 (After)",
    time: "15:40 ~ 20:00",
    desc: "정규장 종료 후에도 거래할 수 있는 NXT만의 특징입니다. 15:30부터 주문 접수가 가능하며, 지정가·최유리지정가·최우선지정가 주문을 지원합니다.",
    tag: "단일가",
    dot: "bg-orange-300",
    color: "bg-orange-50 text-orange-600",
  },
];

const NAV_HEIGHT = 49; // py-3.5(28px) + 텍스트(21px)

// ─── 컴포넌트 ────────────────────────────────────────────────
export default function GuidePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionId>(
    (searchParams.get("section") as SectionId) ?? "intro",
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // 초기 마운트 시 URL 섹션으로 스크롤
  useEffect(() => {
    const section = searchParams.get("section") as SectionId | null;
    if (!section || section === "intro") return;
    // refs가 채워질 때까지 약간 지연
    const timer = setTimeout(() => {
      const el = sectionRefs.current[section];
      const container = contentRef.current;
      if (!el || !container) return;
      container.scrollTo({
        top: el.offsetTop - NAV_HEIGHT - 24,
        behavior: "smooth",
      });
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setSearchParams(
        (p) => {
          if (current === "intro") p.delete("section");
          else p.set("section", current);
          return p;
        },
        { replace: true },
      );
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [setSearchParams]);

  // 활성 탭이 바뀌면 탭 버튼을 가운데로 스크롤
  useEffect(() => {
    const nav = navRef.current;
    const tab = tabRefs.current[activeSection];
    if (!nav || !tab) return;
    const scrollLeft =
      tab.offsetLeft - nav.clientWidth / 2 + tab.clientWidth / 2;
    nav.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [activeSection]);

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
    <div className="relative h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* ── 상단 내비게이션 탭 (콘텐츠 위에 절대 위치) ────── */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/60 dark:bg-slate-900/80 backdrop-blur-lg border-b border-white/40 dark:border-slate-800">
        <div ref={navRef} className="overflow-x-auto scrollbar-hide md:px-8">
          <div className="max-w-3xl md:mx-auto flex items-center gap-1 px-2 md:px-0 w-max md:w-auto">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[id] = el;
                  }}
                  onClick={() => scrollTo(id)}
                  className={[
                    "flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all duration-150 cursor-pointer whitespace-nowrap",
                    isActive
                      ? "border-[#0046FF] text-[#0046FF]"
                      : "border-transparent text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span
                    className={[
                      "text-[12px]",
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
      </div>

      {/* ── 메인 콘텐츠 (탭바 뒤로 스크롤됨) ──────────────── */}
      <div
        ref={contentRef}
        className="h-full overflow-y-auto px-4 pb-8 md:px-8"
        style={{ paddingTop: NAV_HEIGHT + 32 }}
      >
        <div className="max-w-3xl mx-auto space-y-16 break-keep">
          {/* ══ 1. 서비스 소개 ══════════════════════════════ */}
          <section
            ref={(el) => {
              sectionRefs.current["intro"] = el;
            }}
            id="intro"
          >
            {/* 히어로 배너 */}
            <div
              className="rounded-2xl p-5 md:p-8 mb-8 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #1437C8 0%, #0046FF 60%, #3B6FFF 100%)",
              }}
            >
              <div className="relative z-10">
                <span className="inline-block text-[12px] font-semibold bg-white/20 px-3 py-1 rounded-full mb-3">
                  SOLMate 가이드
                </span>
                <h1 className="text-2xl font-semibold mb-2">
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

            <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              SOLMate는 실제 주식 시세를 기반으로 한{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                모의투자 학습 플랫폼
              </strong>
              입니다. 가상 자금으로 주식을 매매하며 투자 실력을 키우고, 다른
              투자자와 함께 성장할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICE_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
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
                    <h3 className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
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

            <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              아래 5단계를 따라 SOLMate의 핵심 기능을 경험해보세요. 순서대로
              따라하면 투자 실력을 빠르게 키울 수 있습니다.
            </p>

            <div className="space-y-4">
              {USAGE_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 flex gap-4 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
                  >
                    {/* 스텝 번호 + 연결선 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-xl ${step.color} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      {i < USAGE_STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 dark:bg-slate-800 mt-2" />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-gray-300 dark:text-slate-600">
                          STEP {step.step}
                        </span>
                        <h3 className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 팁 박스 */}
            <div className="mt-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-2xl p-5 flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-amber-800 mb-1">
                  초보자 팁
                </p>
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  처음에는 관심 있는 기업 2~3개를 골라 소액으로 시작해보세요.
                  매매일지를 꾸준히 작성하면 자신의 투자 패턴을 파악하는 데 큰
                  도움이 됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* ══ 3. 거래 시간 안내 ════════════════════════════ */}
          <section
            ref={(el) => {
              sectionRefs.current["market"] = el;
            }}
            id="market"
          >
            <SectionHeader
              icon={Clock}
              label="거래 시간 안내"
              title="언제 거래할 수 있나요?"
            />

            <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              SOLMate는{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                KRX(한국거래소)
              </strong>
              와{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                NXT(넥스트레이드)
              </strong>{" "}
              두 거래소의 체결 데이터를 모두 지원합니다. 각 거래소는 거래
              가능 시간과 체결 방식이 다르므로 주문 전 확인하세요.
            </p>

            {/* 시간외거래란? */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 mb-6">
              <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                시간외거래란?
              </p>
              <p className="text-[12px] text-gray-600 dark:text-slate-400 leading-relaxed mb-2.5">
                주식 거래는 정규장(09:00~15:30)에만 할 수 있는 게 아닙니다.
                정규장 전후에도 거래가 가능한 시간이 있는데, 이를{" "}
                <strong className="text-gray-800 dark:text-gray-200">
                  시간외거래
                </strong>
                라고 합니다. 직장인처럼 낮 시간에 거래하기 어려운
                투자자이거나, 장 마감 후 나온 공시·실적 발표에 빠르게
                반응하고 싶을 때 활용할 수 있습니다.
              </p>
              <p className="text-[12px] text-gray-600 dark:text-slate-400 leading-relaxed">
                2025년 3월 <strong className="text-gray-800 dark:text-gray-200">넥스트레이드(NXT)</strong>가
                국내 최초 대체거래소로 출범하면서, 기존 KRX의
                시간외거래(~18:00)보다 훨씬 긴 오전 8시~저녁 8시까지 거래할
                수 있는 환경이 갖춰졌습니다.
              </p>
            </div>

            {/* 거래소 요약 비교 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* KRX */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                      KRX
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                      한국거래소
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    정규
                  </span>
                </div>
                <p className="text-[22px] font-bold text-gray-800 dark:text-gray-200 leading-none mb-1">
                  09:00{" "}
                  <span className="text-gray-300 dark:text-slate-600 font-light">
                    ~
                  </span>{" "}
                  15:30
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  정규장 기준 · 총 6.5시간
                </p>
              </div>

              {/* NXT */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-orange-100 dark:border-orange-900/50 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Zap className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                      NXT
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                      넥스트레이드
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                    대체거래소
                  </span>
                </div>
                <p className="text-[22px] font-bold text-gray-800 dark:text-gray-200 leading-none mb-1">
                  08:00{" "}
                  <span className="text-gray-300 dark:text-slate-600 font-light">
                    ~
                  </span>{" "}
                  20:00
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  프리·애프터 포함 · 총 12시간
                </p>
              </div>
            </div>

            {/* KRX 세션 상세 */}
            <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              KRX 거래 시간 상세
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden mb-6">
              {KRX_SESSIONS.map((session, i) => (
                <div
                  key={session.name}
                  className={[
                    "flex items-start gap-3 px-5 py-4",
                    i < KRX_SESSIONS.length - 1
                      ? "border-b border-gray-50 dark:border-slate-800"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${session.dot}`}
                    />
                    {i < KRX_SESSIONS.length - 1 && (
                      <div className="w-px h-6 bg-gray-100 dark:bg-slate-800 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                        {session.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${session.color} dark:bg-opacity-20`}
                      >
                        {session.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium mb-0.5">
                      {session.time}
                    </p>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {session.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* NXT 세션 상세 */}
            <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              NXT 거래 시간 상세
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden mb-6">
              {NXT_SESSIONS.map((session, i) => (
                <div
                  key={session.name}
                  className={[
                    "flex items-start gap-3 px-5 py-4",
                    i < NXT_SESSIONS.length - 1
                      ? "border-b border-gray-50 dark:border-slate-800"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${session.dot}`}
                    />
                    {i < NXT_SESSIONS.length - 1 && (
                      <div className="w-px h-6 bg-gray-100 dark:bg-slate-800 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                        {session.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${session.color} dark:bg-opacity-20`}
                      >
                        {session.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium mb-0.5">
                      {session.time}
                    </p>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {session.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 시간외거래 활용 & 주의 */}
            <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 mb-3">
              시간외거래, 이것만은 알아두세요
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* 활용 상황 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-100 dark:border-green-900/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
                    이럴 때 유용해요
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "정규장 시간에 거래하기 어려운 직장인·학생",
                    "장 마감 후 대형 호재가 나와 다음날 주가 상승이 예상될 때",
                    "장 마감 후 대형 악재가 나와 미리 매도하고 싶을 때",
                    "정규장 타이밍을 놓쳤을 때 종가 그대로 매매하고 싶을 때",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-slate-400"
                    >
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* 주의사항 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
                    주의할 점
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "거래량이 정규장보다 훨씬 적어 체결이 잘 안 될 수 있어요",
                    "특히 시간외단일가는 거래량이 매우 적어 원하지 않는 가격에 체결될 수 있어요",
                    "공시·뉴스 직후 가격이 급변할 수 있으니 신중하게 주문하세요",
                    "처음 투자를 시작했다면 정규장에서 먼저 충분히 익히는 걸 권장해요",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-slate-400"
                    >
                      <span className="text-red-400 mt-0.5 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 체결 방식 설명 */}
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-4">
              <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-3">
                체결 방식이란?
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">
                    접속매매
                  </span>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                    주문이 들어오는 즉시 상대방 주문과 실시간으로 매칭됩니다.
                    정규장 장중에 사용하는 일반적인 방식입니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">
                    단일가매매
                  </span>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                    일정 시간 동안 주문을 모아 가장 많은 거래가 성사되는
                    하나의 가격으로 일괄 체결합니다. 동시호가·시간외·프리/애프터마켓
                    구간에서 사용됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 주의 팁 */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-2xl p-5 flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  초보 투자자라면 꼭 읽어보세요
                </p>
                <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  시간외거래는 정규장보다 거래량이 매우 적습니다. 특히
                  시간외단일가·NXT 애프터마켓은 참여자가 적어 원하지 않는
                  가격에 체결되거나 체결 자체가 안 될 수 있어요. 투자를 막
                  시작했다면 먼저 정규장(09:00~15:30) 거래에 익숙해진 뒤
                  시간외거래를 활용하는 것을 권장합니다. 토·일요일 및
                  공휴일에는 모든 거래가 중단됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* ══ 4. 주식투자 가이드 (구 3번) ════════════════════ */}
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

            <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              주식투자는 기업의 성장에 함께 참여하는 행위입니다. 올바른 전략과
              원칙을 갖추면 안정적으로 자산을 늘릴 수 있습니다.
            </p>

            {/* 수익/손실 예시 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  <span className="text-[12px] font-semibold text-red-600">
                    수익 예시
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  1주 50,000원 매수 →<br />
                  1주 60,000원 매도
                  <br />
                  <strong className="text-red-600">
                    +10,000원 (+20%) 수익
                  </strong>
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-blue-500" />
                  <span className="text-[12px] font-semibold text-blue-600">
                    손실 예시
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  1주 50,000원 매수 →<br />
                  1주 42,000원 매도
                  <br />
                  <strong className="text-blue-600">
                    -8,000원 (-16%) 손실
                  </strong>
                </p>
              </div>
            </div>

            {/* 투자 전략 */}
            <h3 className="text-[16px] font-semibold text-gray-800 dark:text-gray-200 mb-3">
              대표적인 투자 전략
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {INVEST_STRATEGIES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border ${s.borderColor} dark:border-slate-800 hover:shadow-sm transition-all`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center mb-2.5`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {s.title}
                    </h4>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 투자 원칙 */}
            <h3 className="text-[16px] font-semibold text-gray-800 dark:text-gray-200 mb-3">
              투자 원칙 & 주의사항
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              {INVEST_RULES.map((rule, i) => (
                <div
                  key={rule.title}
                  className={[
                    "flex items-start gap-3 px-5 py-4",
                    i < INVEST_RULES.length - 1
                      ? "border-b border-gray-50 dark:border-slate-800"
                      : "",
                  ].join(" ")}
                >
                  <rule.icon className={`w-5 h-5 shrink-0 ${rule.iconColor}`} />
                  <div>
                    <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                      {rule.title}
                    </p>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 수수료 안내 */}
            <div className="mt-6 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 flex gap-3">
              <span className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5 text-[15px] font-semibold leading-none flex items-center justify-center">
                ₩
              </span>
              <div>
                <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  수수료 안내
                </p>
                <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
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

            <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              주식 투자에 자주 등장하는 핵심 용어를 정리했습니다. 용어를
              이해하면 시장을 더 명확하게 읽을 수 있습니다.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {STOCK_TERMS.map((item) => (
                <div
                  key={item.term}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 flex gap-4 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
                >
                  <item.icon className="w-6 h-6 shrink-0 text-[#0046FF]" />
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                      {item.term}
                    </p>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 마무리 배너 */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
              <p className="text-[16px] font-semibold mb-1">이제 준비됐나요?</p>
              <p className="text-blue-100 text-[12px] mb-4">
                SOLMate와 함께 모의투자를 시작해보세요!
              </p>
              <a
                href="/invest"
                className="inline-flex items-center gap-1.5 bg-white text-blue-600 text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
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
      <h2 className="text-[20px] font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <div className="mt-2 w-10 h-0.5 bg-[#0046FF] rounded-full" />
    </div>
  );
}
