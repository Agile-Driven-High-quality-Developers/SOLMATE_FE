import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

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

export default function PortfolioChart({ items }: { items: PortfolioItem[] }) {
  const chartData = {
    labels: items.map((i) => i.stockName),
    datasets: [
      {
        data: items.map((i) => i.ratio),
        backgroundColor: COLORS.slice(0, items.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  const total = items.reduce((s, i) => s + i.ratio, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-[16px] font-bold text-gray-900 mb-5">종목 비중</h2>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48">
          <Doughnut data={chartData} options={options as never} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[11px] text-gray-400">총 자산</p>
            <p className="text-[14px] font-bold text-gray-900">{total}%</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          {items.map((item, idx) => (
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
