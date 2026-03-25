import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement } from "chart.js";

ChartJS.register(ArcElement);

export type PortfolioItem = {
  stockName: string;
  ratio: number;
};

const COLORS = [
  "#0046FF",
  "#7C3AED",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#F97316",
  "#06B6D4",
  "#84CC16",
];

const TOP_N = 5;

function toDisplayItems(items: PortfolioItem[]) {
  if (items.length <= TOP_N) return items;
  const top = items.slice(0, TOP_N);
  const etcRatio = items.slice(TOP_N).reduce((s, i) => s + i.ratio, 0);
  return [...top, { stockName: "기타", ratio: etcRatio }];
}

export default function PortfolioChart({ items }: { items: PortfolioItem[] }) {
  const displayed = toDisplayItems(items);
  const [hovered, setHovered] = useState<PortfolioItem | null>(null);

  const chartData = {
    labels: displayed.map((i) => i.stockName),
    datasets: [
      {
        data: displayed.map((i) => i.ratio),
        backgroundColor: COLORS.slice(0, displayed.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    layout: { padding: 8 },
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    onHover: (_: unknown, elements: { index: number }[]) => {
      if (elements.length > 0) {
        setHovered(displayed[elements[0].index]);
      } else {
        setHovered(null);
      }
    },
  };

  const total = items.reduce((s, i) => s + i.ratio, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full">
      <h2 className="text-[16px] font-bold text-gray-900 mb-5">종목 비중</h2>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-56 h-56">
          <Doughnut data={chartData} options={options as never} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hovered ? (
              <>
                <p className="text-[11px] text-gray-400">{hovered.stockName}</p>
                <p className="text-[14px] font-bold text-gray-900">{hovered.ratio}%</p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-gray-400">총 자산</p>
                <p className="text-[14px] font-bold text-gray-900">{total}%</p>
              </>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          {displayed.map((item, idx) => (
            <div key={item.stockName} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-[13px] text-gray-700">{item.stockName}</span>
              </div>
              <span className="text-[13px] font-medium text-gray-500">{item.ratio}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
