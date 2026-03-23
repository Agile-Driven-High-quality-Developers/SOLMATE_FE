import { TrendingUp } from "lucide-react";

export default function Logo({
  appName,
  appSubtitle,
}: {
  appName: string;
  appSubtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[10px] bg-[#0046FF] flex items-center justify-center shrink-0">
        <TrendingUp className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-gray-900 leading-tight truncate">
          {appName}
        </p>
        <p className="text-[12px] text-gray-400 mt-px truncate">
          {appSubtitle}
        </p>
      </div>
    </div>
  );
}
