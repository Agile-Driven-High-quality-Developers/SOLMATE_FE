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
        "rounded-md px-2.5 py-0.5 text-white text-[12px] font-semibold",
        className,
      ].join(" ")}
    >
      {name}
    </span>
  );
}
