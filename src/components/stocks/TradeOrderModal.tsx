import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type OrderType = "MARKET" | "LIMIT";

export type OrderSide = "buy" | "sell";

type Props = {
  side: OrderSide;
  stockName: string;
  currentPrice: number;
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
  currentPrice,
  cash,
  holdingQuantity,
  onClose,
  onConfirm,
}: Props) {
  const isBuy = side === "buy";
  const accent = {
    text: isBuy ? "text-red-500" : "text-[#0046FF]",
    bg: isBuy ? "bg-red-500 hover:bg-red-600" : "bg-[#0046FF] hover:bg-blue-700",
    bgLight: isBuy ? "bg-red-50" : "bg-blue-50",
  };

  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [limitPrice, setLimitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [diary, setDiary] = useState("");

  const execPrice = orderType === "MARKET" ? currentPrice : Number(limitPrice) || 0;
  const qty = parseInt(quantity) || 0;
  const totalAmount = execPrice * qty;

  const maxQty = isBuy
    ? Math.floor(cash / currentPrice)
    : holdingQuantity;

  const canSubmit = qty > 0 && diary.trim().length > 0 && (orderType === "MARKET" || execPrice > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md z-10 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900">
              <span className={accent.text}>{isBuy ? "매수" : "매도"}</span>{" "}
              {stockName}
            </h3>
            <p className="text-[13px] text-gray-400 mt-0.5">
              현재가: {currentPrice.toLocaleString()}원
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 주문 가능금액 */}
        <div className={`rounded-xl px-4 py-3 mb-4 ${accent.bgLight}`}>
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-gray-500">주문 가능금액</span>
            <span className={`text-[13px] font-bold ${accent.text}`}>
              {cash.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 시장가 / 지정가 */}
        <div className="flex gap-2 mb-4">
          {(["MARKET", "LIMIT"] as OrderType[]).map((t) => (
            <Button
              key={t}
              onClick={() => setOrderType(t)}
              className={`flex-1 py-2 text-[13px] cursor-pointer ${
                orderType === t ? `${accent.bg} text-white` : "bg-gray-100 text-gray-500"
              }`}
            >
              {t === "MARKET" ? "시장가" : "지정가"}
            </Button>
          ))}
        </div>

        {/* 가격 */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
            주문가격
          </label>
          {orderType === "MARKET" ? (
            <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-[13px] text-gray-500">
              {currentPrice.toLocaleString()}원 (시장가)
            </div>
          ) : (
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="가격을 입력하세요"
            />
          )}
        </div>

        {/* 수량 */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
            수량 (주)
          </label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="1"
          />
          <p className="text-[12px] text-gray-400 mt-1">
            최대 {maxQty}주 {isBuy ? "매수" : "매도"} 가능
          </p>
        </div>

        {/* 주문금액 */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500">주문금액</span>
            <span className="font-bold text-gray-900">
              {qty > 0 ? totalAmount.toLocaleString() : "-"}원
            </span>
          </div>
        </div>

        {/* 매매일지 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              매매일지 <span className="text-red-400">*</span>
              <span className="text-[12px] font-normal text-gray-400 ml-1">(필수)</span>
            </label>
            <span className={`text-[12px] ${diary.length > 450 ? "text-red-400" : "text-gray-400"}`}>
              {diary.length}/500
            </span>
          </div>
          <textarea
            value={diary}
            onChange={(e) => e.target.value.length <= 500 && setDiary(e.target.value)}
            placeholder="이 종목을 매수/매도한 이유, 전략, 목표가 등을 기록하세요."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-[#0046FF] transition-colors resize-none leading-relaxed"
          />
          {!diary.trim() && qty > 0 && (
            <p className="text-[12px] text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle size={11} />
              매매일지를 작성해야 주문할 수 있습니다.
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="invalid"
            className="flex-1 py-3 text-[13px] font-semibold cursor-pointer"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            disabled={!canSubmit}
            className={`flex-1 py-3 text-[13px] font-bold cursor-pointer disabled:opacity-40 ${accent.bg}`}
            onClick={() => onConfirm({ orderType, price: execPrice, quantity: qty, diary })}
          >
            {isBuy ? "매수하기" : "매도하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
