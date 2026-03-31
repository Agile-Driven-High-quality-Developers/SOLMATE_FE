import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronsLeftRight } from "lucide-react";

type Props = {
  children: ReactNode;
  className?: string;
  /** hint 오버레이 표시 조건 클래스 (기본: "flex")
   * 예) 모바일만 표시: "flex md:hidden"
   * 예) 데스크탑만 표시: "hidden md:flex"
   */
  hintVisibility?: string;
};

export default function ScrollHintOverlay({
  children,
  className = "",
  hintVisibility = "flex",
}: Props) {
  const [showHint, setShowHint] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative overflow-x-auto ${className}`}
      ref={ref}
      onScroll={() => setShowHint(false)}
    >
      {showHint && (
        <div
          className={`absolute inset-0 z-10 ${hintVisibility} flex-col items-center justify-center gap-2 bg-white/10 dark:bg-slate-900/10 backdrop-blur-[2px] rounded-xl cursor-pointer`}
          onClick={() => setShowHint(false)}
        >
          <ChevronsLeftRight size={22} className="text-gray-400 dark:text-slate-400" />
          <p className="text-[14px] font-medium text-gray-500 dark:text-slate-400">
            좌우로 스크롤 해보세요
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
