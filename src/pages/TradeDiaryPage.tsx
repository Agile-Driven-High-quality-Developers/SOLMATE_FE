import { Search } from "lucide-react";
import { useState } from "react";

export default function TradeDiaryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">매매일지</h1>
      </div>
      {/* 검색 + 정렬 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="종목명 또는 코드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0046FF] transition-colors"
          />
        </div>
      </div>

      {/* 매매일지 리스트 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"></div>
    </div>
  );
}
