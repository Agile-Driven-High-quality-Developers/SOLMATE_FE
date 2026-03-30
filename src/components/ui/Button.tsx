import { cn } from "@/lib/cn";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "basic" | "invalid" | "danger";
  type?: "button" | "submit" | "reset";
  width?: number;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

const variantClass = {
  primary: "bg-[#0046FF] text-white hover:bg-[#0038CC]",
  basic: "border border-[#0046FF] text-[#0046FF] hover:bg-blue-50 dark:hover:bg-blue-950",
  invalid: "text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700",
  danger: "border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  width,
  className,
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      style={{ width: width ? `${width}px` : undefined }}
      className={cn("rounded-[10px] py-1.5", variantClass[variant], className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
