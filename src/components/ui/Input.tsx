type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export default function Input({
  className = "",
  label,
  error,
  hint,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* label이 있을 때만 렌더 */}
      {label && (
        <label className="text-[14px] font-medium text-gray-700">{label}</label>
      )}
      <input
        className={[
          "w-full px-3 py-2.5 rounded-[10px]",
          "border border-gray-200 outline-none",
          "text-[16px] text-gray-900 placeholder:text-gray-400",
          "transition-colors duration-150",
          error
            ? "border-red-400 focus:border-red-500"
            : "focus:border-[#0046FF]",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-[13px] text-red-500">{error}</p>}
      {hint && !error && <p className="text-[13px] text-green-600">{hint}</p>}
    </div>
  );
}
