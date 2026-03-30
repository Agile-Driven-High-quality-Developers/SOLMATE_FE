import solmateLogo from "/solmate_logo.png";

export default function Logo({
  appName,
  appSubtitle,
}: {
  appName: string;
  appSubtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-md shrink-0">
        <img
          src={solmateLogo}
          alt="SOLMATE logo"
          className="w-full h-full object-contain rounded-md"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-gray-900 leading-tight truncate dark:text-gray-100">
          {appName}
        </p>
        <p className="text-[12px] text-gray-400 mt-px truncate dark:text-slate-500">
          {appSubtitle}
        </p>
      </div>
    </div>
  );
}
