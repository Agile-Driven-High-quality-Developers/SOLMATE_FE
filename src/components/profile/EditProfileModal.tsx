import { useState } from "react";
import { X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { fetchClient } from "@/lib/fetchClient";
import type { ApiResponse } from "@/api/authApi";

type Props = {
  nickname: string;
  profileImageUrl?: string | null;
  onClose: () => void;
  onSave: (newNickname: string) => void;
};

export default function EditProfileModal({ nickname, profileImageUrl, onClose, onSave }: Props) {
  const [value, setValue] = useState(nickname);
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNicknameChange = (v: string) => {
    setValue(v);
    setChecked(false);
    setNicknameError("");
  };

  const handleCheckNickname = async () => {
    if (!value.trim() || value === nickname) {
      setChecked(true);
      return;
    }
    setChecking(true);
    try {
      await fetchClient.get<ApiResponse<void>>("/api/auth/nickname/check", { nickname: value });
      setChecked(true);
      setNicknameError("");
    } catch {
      setNicknameError("이미 사용 중인 닉네임입니다.");
    } finally {
      setChecking(false);
    }
  };

  const handleSave = async () => {
    if (!checked && value !== nickname) return;
    setSaving(true);
    try {
      await fetchClient.patch<ApiResponse<void>>("/api/users/me", { nickname: value });
      onSave(value);
      onClose();
    } catch {
      setNicknameError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = value.trim() && (value === nickname || checked) && !nicknameError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl w-96 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[16px] font-bold text-gray-900">프로필 편집</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {/* 아바타 */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <Avatar name={value} src={profileImageUrl ?? undefined} size={72} />
          </div>
        </div>

        {/* 닉네임 */}
        <div className="mb-1">
          <p className="text-[12px] text-gray-400 mb-1.5">닉네임</p>
          <div className="flex gap-2">
            <input
              value={value}
              onChange={(e) => handleNicknameChange(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#0046FF]"
              placeholder="닉네임"
            />
            <Button variant="basic" onClick={handleCheckNickname} disabled={checking}>
              {checking ? "확인 중" : "중복확인"}
            </Button>
          </div>
          {nicknameError && <p className="text-[11px] text-red-500 mt-1">{nicknameError}</p>}
          {checked && !nicknameError && value !== nickname && (
            <p className="text-[11px] text-blue-500 mt-1">사용 가능한 닉네임입니다.</p>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="ghost" className="flex-1" onClick={onClose}>취소</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
