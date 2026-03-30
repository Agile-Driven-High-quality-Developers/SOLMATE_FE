import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import type { OrderSide } from "@/components/stocks/TradeOrderModal";

type Props = {
  side: OrderSide;
  stockName: string;
  orderType: "MARKET" | "LIMIT";
  price: number;
  quantity: number;
  totalAmount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function TradeConfirmModal({
  side,
  stockName,
  orderType,
  price,
  quantity,
  totalAmount,
  onClose,
  onConfirm,
}: Props) {
  const isBuy = side === "buy";
  const accent = {
    text: isBuy ? "text-red-500" : "text-[#0046FF]",
    bg: isBuy
      ? "bg-red-500 hover:bg-red-600"
      : "bg-[#0046FF] hover:bg-blue-700",
    icon: isBuy ? "text-red-400" : "text-blue-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-sm z-10 shadow-2xl text-center">
        <AlertCircle size={32} className={`mx-auto mb-3 ${accent.icon}`} />
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-4">주문 확인</h3>

        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-5 text-left space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400 dark:text-slate-500">종목</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{stockName}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400 dark:text-slate-500">구분</span>
            <span className={`font-semibold ${accent.text}`}>
              {isBuy ? "매수" : "매도"}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400 dark:text-slate-500">주문유형</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {orderType === "MARKET" ? "시장가" : "지정가"}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400 dark:text-slate-500">주문가격</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {price.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-400 dark:text-slate-500">수량</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{quantity}주</span>
          </div>
          <div className="flex justify-between text-[13px] pt-2 border-t border-gray-200 dark:border-slate-700">
            <span className="text-gray-400 dark:text-slate-500">총 주문금액</span>
            <span className={`font-bold text-[14px] ${accent.text}`}>
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        <p className="text-[12px] text-gray-400 dark:text-slate-500 mb-4">
          매매일지가 함께 저장됩니다.
        </p>

        <div className="flex gap-2">
          <Button
            variant="invalid"
            className="flex-1 py-3 text-[13px] font-semibold cursor-pointer"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            className={`flex-1 py-3 text-[13px] font-bold cursor-pointer ${accent.bg}`}
            onClick={onConfirm}
          >
            {isBuy ? "매수" : "매도"} 확인
          </Button>
        </div>
      </div>
    </div>
  );
}
