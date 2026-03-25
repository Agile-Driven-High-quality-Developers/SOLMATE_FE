import Badge from "@/components/ui/Badge";

export type TradeDiaryItem = {
  diaryId: string;
  tradeType: "BUY" | "SELL";
  stockName: string;
  quantity: number;
  filledPrice: number;
  profit: number;
  content: string;
  createdAt: string;
};

type Props = {
  items: TradeDiaryItem[];
};

export default function TradeDiaryTab({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[14px] text-gray-400">
        매매일지가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const isBuy = item.tradeType === "BUY";
        const isPositive = item.profit >= 0;

        return (
          <div
            key={item.diaryId}
            className="flex flex-col gap-2 px-6 py-5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  name={isBuy ? "매수" : "매도"}
                  color={isBuy ? "#FF4444" : "#0046FF"}
                />
                <span className="text-[15px] font-bold text-gray-900">
                  {item.stockName}
                </span>
                <span className="text-[13px] text-gray-400">{item.quantity}주</span>
                <span className="text-gray-300">·</span>
                <span className="text-[13px] text-gray-400">
                  {item.filledPrice.toLocaleString()}원
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-[13px] text-gray-400">
                  {item.createdAt.slice(0, 10).replace(/-/g, ".")}
                </span>
              </div>
              {item.profit !== 0 && (
                <span
                  className={`text-[13px] font-semibold ${
                    isPositive ? "text-[#FF4444]" : "text-[#0046FF]"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {item.profit.toLocaleString()}원
                </span>
              )}
            </div>
            <p className="text-[14px] text-gray-700 leading-relaxed">
              {item.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
