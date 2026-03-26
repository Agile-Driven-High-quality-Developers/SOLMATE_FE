import { useState } from "react";
import { Trash2 } from "lucide-react";
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
      // 1단계: 비밀번호 확인
      await fetchClient.post<ApiResponse<void>>("/api/users/password/check", { password });
      // 2단계: 회원 탈퇴
      await fetchClient.delete<ApiResponse<void>>("/api/users");
      onDeleted();
    } catch {
      setError("비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl w-80 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <p className="text-[15px] font-bold text-gray-900 mb-1">회원탈퇴</p>
          <p className="text-[13px] text-gray-400 text-center">정말 이 모든 데이터가 삭제됩니다.</p>
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="비밀번호 확인"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[14px] outline-none focus:border-red-400"
          />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="invalid" className="flex-1" onClick={onClose}>취소</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={!password || loading}>
            {loading ? "처리 중..." : "탈퇴"}
          </Button>
        </div>
      </div>
    </div>
  );
}
