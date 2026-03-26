type Tab = {
  id: string;
  label: string;
};
type TabBarProps = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
};

export default function TabBar({ tabs, activeId, onChange, variant = "pill" }: TabBarProps) {
  if (variant === "underline") {
    return (
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 py-3 text-[15px] font-semibold transition-colors duration-150 border-b-2 -mb-px ${
                isActive
                  ? "text-[#0046FF] border-[#0046FF]"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={
              isActive
                ? {
                    background: "#0046FF",
                    color: "#ffffff",
                    border: "1px solid #0046FF",
                  }
                : { background: "#ffffff" }
            }
            className="px-4 py-2 text-[16px] transition-colors duration-150 rounded-4xl font-semibold text-[#6B7280] border border-[#F3F4F6]"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
