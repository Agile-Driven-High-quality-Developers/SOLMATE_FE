type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
};

export default function UnderlineTabBar({ tabs, activeId, onChange }: Props) {
  return (
    <div className="flex border-b border-gray-100 dark:border-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-4 text-[14px] font-semibold transition-colors ${
            activeId === tab.id
              ? "text-[#0046FF] border-b-2 border-[#0046FF]"
              : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
