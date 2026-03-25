type Props = {
  label: string;
  value: string;
  sub?: string;
  variant?: "blue" | "white";
  valueColor?: string;
  subColor?: string;
};

export default function SummaryCard({
  label,
  value,
  sub,
  variant = "white",
  valueColor,
  subColor,
}: Props) {
  const isBlue = variant === "blue";

  return (
    <div
      className={`rounded-2xl px-6 py-5 ${
        isBlue ? "bg-[#0046FF] text-white" : "bg-white border border-gray-100"
      }`}
    >
      <p className={`text-[13px] font-medium mb-2 ${isBlue ? "opacity-80" : "text-gray-400"}`}>
        {label}
      </p>
      <p
        className={`font-bold ${isBlue ? "text-[28px]" : "text-[22px]"} ${
          valueColor ?? (isBlue ? "text-white" : "text-gray-900")
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className={`text-[12px] mt-1 font-medium ${subColor ?? (isBlue ? "text-red-300" : "text-gray-400")}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
