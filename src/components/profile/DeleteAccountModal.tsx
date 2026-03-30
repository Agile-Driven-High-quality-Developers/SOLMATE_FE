import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { fetchClient } from "@/lib/fetchClient";
import { useMyProfileQuery } from "@/api/userListApi";
import type { ApiResponse } from "@/api/authApi";

type Props = {
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteAccountModal({ onClose, onDeleted }: Props) {
  const { data: myProfile } = useMyProfileQuery();
  const isGoogle = myProfile?.provider === "GOOGLE";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!isGoogle && !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      await fetchClient.delete<ApiResponse<void>>(
        "/api/users",
        isGoogle ? {} : { password },
      );
      onDeleted();
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "";
      if (msg.includes("400")) {
        setError("비밀번호가 올바르지 않아요.");
      } else {
        setError("탈퇴 처리에 실패했어요. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-90 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
            회원탈퇴
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          {isGoogle ? (
            <div>
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
                정말 탈퇴하시겠어요?
              </p>
              <p className="text-[13px] text-gray-400 dark:text-slate-500">
                탈퇴 후 계정 정보는 영구적으로 삭제돼요.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">
                탈퇴 전 본인 확인이 필요해요
              </p>
              <p className="text-[13px] text-gray-400 dark:text-slate-500">
                비밀번호를 입력하면 계정이 영구적으로 삭제돼요.
              </p>
            </div>
          )}

          {!isGoogle && (
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="비밀번호를 입력해주세요"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-red-400 transition-colors bg-white dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-slate-500"
                onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              />
              {error && (
                <p className="text-[12px] text-red-500 mt-1.5">{error}</p>
              )}
            </div>
          )}

          {isGoogle && error && (
            <p className="text-[12px] text-red-500">{error}</p>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <Button variant="invalid" className="flex-1 py-2.5" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="danger"
            className="flex-1 py-2.5"
            onClick={handleDelete}
            disabled={(!isGoogle && !password) || loading}
          >
            {loading ? "처리 중..." : "탈퇴하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
