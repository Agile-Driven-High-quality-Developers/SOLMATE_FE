type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "basic" | "invalid";
  width?: number;
  className?: string;
  onClick?: () => void;
};

const variantClass = {
  primary: "bg-[#0046FF] text-white hover:bg-[#0038CC]",
  basic: "border border-[#0046FF] text-[#0046FF] hover:bg-blue-50",
  invalid: "text-gray-600 hover:bg-gray-100",
};

export default function Button({
  children,
  variant = "primary",
  width,
  className,
  onClick,
}: ButtonProps) {
  return (
    <button
      style={{ width: width ? `${width}px` : undefined }}
      className={[
        "rounded-[10px]",
        "py-1.5",
        variantClass[variant],
        className,
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
