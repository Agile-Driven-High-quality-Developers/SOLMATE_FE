import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "@/api/authApi";

type Props = {
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteAccountModal({ onClose, onDeleted }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      await fetchClient.post<ApiResponse<void>>("/api/users/password/check", { password });
      await fetchClient.delete<ApiResponse<void>>("/api/users");
      onDeleted();
    } catch {
      setError("비밀번호가 올바르지 않아요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[360px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-[15px] font-bold text-gray-900">회원탈퇴</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          <div>
            <p className="text-[14px] text-gray-700 font-medium mb-1">탈퇴 전 본인 확인이 필요해요</p>
            <p className="text-[13px] text-gray-400">비밀번호를 입력하면 계정이 영구적으로 삭제돼요.</p>
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="비밀번호를 입력해주세요"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-red-400 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
            />
            {error && <p className="text-[12px] text-red-500 mt-1.5">{error}</p>}
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <Button variant="invalid" className="flex-1 py-2.5" onClick={onClose}>취소</Button>
          <Button variant="danger" className="flex-1 py-2.5" onClick={handleDelete} disabled={!password || loading}>
            {loading ? "처리 중..." : "탈퇴하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
