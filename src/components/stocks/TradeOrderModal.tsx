import { useState } from "react";
import { X, AlertCircle, Wallet, Tag, Hash, PenLine } from "lucide-react";
import { adjustToTickSize, getTickSize } from "@/lib/tickSize";
import SpotlightTour from "@/components/onboarding/SpotlightTour";
import type { TourStep } from "@/components/onboarding/SpotlightTour";
import DiaryMiniChart from "@/components/profile/DiaryMiniChart";

const TRADE_ORDER_TOUR: TourStep[] = [
  {
    target: "trade-order-available",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Wallet size={15} />
        주문 가능금액
      </span>
    ),
    description:
      "현재 내 예수금(투자에 쓸 수 있는 현금)이에요. 이 금액 안에서만 매수할 수 있어요.",
    placement: "bottom",
  },
  {
    target: "trade-order-type",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Tag size={15} />
        시장가 vs 지정가
      </span>
    ),
    description: "주문 방식을 선택해요.",
    items: [
      "시장가 — 지금 바로 현재 가격으로 체결돼요",
      "지정가 — 내가 원하는 가격을 직접 입력해요. 그 가격이 될 때 체결돼요",
    ],
    placement: "bottom",
  },
  {
    target: "trade-order-quantity",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <Hash size={15} />
        수량 입력
      </span>
    ),
    description: "몇 주를 살지 입력해요. 아래 최대 수량을 넘을 수 없어요.",
    placement: "bottom",
  },
  {
    target: "trade-order-diary",
    title: (
      <span className="inline-flex items-center gap-1.5">
        <PenLine size={15} />
        매매일지 (필수)
      </span>
    ),
    description:
      "이 주식을 사는 이유를 꼭 기록해야 주문할 수 있어요. 나중에 내 투자 패턴을 분석하는 데 도움이 돼요.",
    placement: "top",
  },
];

type OrderType = "MARKET" | "LIMIT";

export type OrderSide = "buy" | "sell";

type Props = {
  side: OrderSide;
  stockName: string;
  tickerCode: string;
  currentPrice: number;
  initialPrice?: number;
  cash: number;
  holdingQuantity: number;
  onClose: () => void;
  onConfirm: (params: {
    orderType: OrderType;
    price: number;
    quantity: number;
    diary: string;
  }) => void;
};

export default function TradeOrderModal({
  side,
  stockName,
  tickerCode,
  currentPrice,
  initialPrice,
  cash,
  holdingQuantity,
  onClose,
  onConfirm,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isBuy = side === "buy";

  // 다크모드에서 너무 밝은 배경색 대신 반투명도를 활용하도록 수정
  const accent = {
    text: isBuy ? "text-red-500" : "text-blue-500",
    bg: isBuy
      ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
    // 다크모드 대응 라이트 배경 (투명도 조절)
    bgLight: isBuy
      ? "bg-red-50 dark:bg-red-500/10"
      : "bg-blue-50 dark:bg-blue-500/10",
  };

  const [orderType, setOrderType] = useState<OrderType>(
    initialPrice ? "LIMIT" : "MARKET",
  );
  const [limitPrice, setLimitPrice] = useState(
    initialPrice ? String(initialPrice) : "",
  );
  const [limitPriceAdjusted, setLimitPriceAdjusted] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [diary, setDiary] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const execPrice =
    orderType === "MARKET" ? currentPrice : Number(limitPrice) || 0;
  const qty = parseInt(quantity) || 0;
  const totalAmount = execPrice * qty;
  const maxQty = isBuy ? Math.floor(cash / currentPrice) : holdingQuantity;
  const canSubmit =
    qty > 0 &&
    diary.trim().length > 0 &&
    (orderType === "MARKET" || execPrice > 0);

  const handleSubmit = () => {
    if (isBuy && totalAmount > cash) {
      setValidationError("잔액이 부족합니다. 주문 금액을 확인해 주세요.");
      return;
    }
    if (!isBuy && qty > holdingQuantity) {
      setValidationError("보유 수량이 부족합니다. 주문 수량을 확인해 주세요.");
      return;
    }
    setValidationError(null);
    onConfirm({ orderType, price: execPrice, quantity: qty, diary });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl p-5 md:p-6 w-full md:max-w-md z-10 shadow-2xl border border-transparent dark:border-slate-800 overflow-y-auto max-h-[92dvh] md:max-h-[90vh]">
        {/* 모바일 드래그 핸들 */}
        <div className="md:hidden w-10 h-1 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[14px] font-semibold px-1.5 py-0.5 rounded ${isBuy ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"}`}
              >
                {isBuy ? "매수" : "매도"}
              </span>
              <h3 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100">
                {stockName}
              </h3>
            </div>
            <p className="text-[12px] text-gray-400 dark:text-slate-500 mt-1 tabular-nums">
              현재가:{" "}
              <span className="text-gray-600 dark:text-gray-300">
                {currentPrice.toLocaleString()}원
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400 dark:text-slate-500" />
          </button>
        </div>

        {/* 주문 가능금액 */}
        <div
          className={`rounded-xl px-4 py-3 mb-4 ${accent.bgLight} border border-transparent dark:border-white/5`}
          data-tour="trade-order-available"
        >
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-medium text-gray-500 dark:text-slate-400">
              주문 가능금액
            </span>
            <span
              className={`text-[14px] font-semibold tabular-nums ${accent.text}`}
            >
              {cash.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 시장가 / 지정가 탭 */}
        <div
          className="flex bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 mb-4 border dark:border-slate-800"
          data-tour="trade-order-type"
        >
          {(["MARKET", "LIMIT"] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                orderType === t
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-500"
              }`}
            >
              {t === "MARKET" ? "시장가" : "지정가"}
            </button>
          ))}
        </div>

        {/* 가격 & 수량 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[12px] font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block ml-1">
              주문가격
            </label>
            {orderType === "MARKET" ? (
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/80 text-[12px] text-gray-400 dark:text-slate-500 tabular-nums">
                {currentPrice.toLocaleString()}
              </div>
            ) : (
              <>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => {
                    setLimitPrice(e.target.value);
                    setLimitPriceAdjusted(false);
                  }}
                  onBlur={() => {
                    const raw = Number(limitPrice);
                    if (!raw) return;
                    const adjusted = adjustToTickSize(raw);
                    if (adjusted !== raw) {
                      setLimitPrice(String(adjusted));
                      setLimitPriceAdjusted(true);
                    } else {
                      setLimitPriceAdjusted(false);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tabular-nums"
                />
                {limitPriceAdjusted && (
                  <p className="text-[11px] text-blue-500 mt-1 ml-1">
                    호가 단위({getTickSize(Number(limitPrice)).toLocaleString()}
                    원)에 맞게 자동 보정됐어요.
                  </p>
                )}
              </>
            )}
          </div>
          <div data-tour="trade-order-quantity">
            <label className="text-[12px] font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block ml-1">
              수량 (주)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tabular-nums"
            />
          </div>
        </div>

        <div className="flex justify-between px-1 mb-4">
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            최대 {maxQty}주 {isBuy ? "매수" : "매도"} 가능
          </p>
          <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">
            총 {qty > 0 ? totalAmount.toLocaleString() : "0"}원
          </p>
        </div>

        {/* 미니 차트 */}
        <div className="mb-4 rounded-xl overflow-hidden border dark:border-slate-800">
          <DiaryMiniChart
            tickerCode={tickerCode}
            tradeDate={today}
            tradeDateTime={new Date().toISOString()}
            tradeType={isBuy ? "BUY" : "SELL"}
            filledPrice={currentPrice}
            chartHeight={60}
          />
        </div>

        {/* 매매일지 */}
        <div className="mb-5" data-tour="trade-order-diary">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <label className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">
              매매일지 <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] ${diary.length > 450 ? "text-red-500" : "text-gray-400 dark:text-slate-500"}`}
            >
              {diary.length}/500
            </span>
          </div>
          <textarea
            value={diary}
            onChange={(e) =>
              e.target.value.length <= 500 && setDiary(e.target.value)
            }
            placeholder="매수/매도 전략을 기록하세요 (필수)"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
          />
          {!diary.trim() && qty > 0 && (
            <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 ml-1">
              <AlertCircle size={12} />
              매매일지를 작성해야 주문할 수 있습니다.
            </p>
          )}
        </div>

        <SpotlightTour tourKey="trade-order" steps={TRADE_ORDER_TOUR} />

        {/* 유효성 에러 메시지 */}
        {validationError && (
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2.5 mb-3">
            <AlertCircle size={14} />
            {validationError}
          </p>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`flex-[1.5] py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-30 disabled:grayscale ${accent.bg}`}
          >
            {isBuy ? "매수하기" : "매도하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
