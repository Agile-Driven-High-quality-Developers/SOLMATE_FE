type BadgeProps = {
  name: string;
  color: string;
  className?: string;
};

export default function Badge({ name, color, className }: BadgeProps) {
  return (
    <span
      style={{ background: color }}
      className={[
        "rounded-md px-3 py-1.5 text-white text-[16px] font-semibold",
        className,
      ].join(" ")}
    >
      {name}
    </span>
  );
}
