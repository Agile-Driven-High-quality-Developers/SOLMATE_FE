type AvatarProps = {
  name: string;
  color?: string;
  size?: number;
  src?: string;
  className?: string;
  onClick?: () => void;
};

// ────────────────────────────────────────────────────────────
// 이니셜 추출
// "삼성전자" → "삼", "SK하이닉스" → "S", "투자왕김철수" → "투"
// ────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  if (!name) return "?";
  // 영문으로 시작하면 앞 1~2자 대문자
  if (/^[A-Za-z]/.test(name)) {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  // 한글이면 첫 글자
  return name.slice(0, 1);
}

export default function Avatar({
  name,
  color = "#0046FF",
  size = 40,
  src,
  className = "",
  onClick,
}: AvatarProps) {
  const initials = getInitials(name);

  // 이미지 아바타
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        onClick={onClick}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={[
          "rounded-full flex items-center justify-center shrink-0 select-none object-cover overflow-hidden",
          onClick ? "cursor-pointer" : "",
          className,
        ].join(" ")}
      />
    );
  }

  // 이니셜 아바타
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 select-none object-cover"
      style={{
        background: color,
        color: "#ffffff",
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={onClick}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
