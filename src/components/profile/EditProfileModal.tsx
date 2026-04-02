import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { fetchClient } from "@/lib/fetchClient";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/api/authApi";

type Props = {
  nickname: string;
  profileImageUrl?: string | null;
  onClose: () => void;
  onSave: (newNickname: string) => void;
};

export default function EditProfileModal({
  nickname,
  profileImageUrl,
  onClose,
  onSave,
}: Props) {
  const queryClient = useQueryClient();
  const [nicknameValue, setNicknameValue] = useState(nickname);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNicknameChange = (v: string) => {
    setNicknameValue(v);
    setNicknameChecked(false);
    setNicknameMsg(null);
  };

  const handleCheckNickname = async () => {
    if (!nicknameValue.trim()) return;
    setChecking(true);
    try {
      await fetchClient.get<ApiResponse<void>>("/api/users/nickname/check", {
        nickname: nicknameValue,
      });
      setNicknameChecked(true);
      setNicknameMsg({ text: "사용 가능한 닉네임이에요.", ok: true });
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "";
      if (msg.includes("400")) {
        setNicknameMsg({ text: "현재 사용 중인 닉네임이에요.", ok: false });
      } else {
        setNicknameMsg({
          text: "이미 다른 사람이 사용 중인 닉네임이에요.",
          ok: false,
        });
      }
    } finally {
      setChecking(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setImageError("이미지는 2MB 이하만 업로드할 수 있어요.");
      e.target.value = "";
      return;
    }
    setImageError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (nicknameValue !== nickname)
        formData.append("nickname", nicknameValue);
      if (imageFile) formData.append("image", imageFile);

      await fetchClient.patchForm("/api/users/profile", formData);
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      // 이미지 변경 시 auth store의 imageUrl도 최신값으로 동기화
      if (imageFile) {
        try {
          const profileRes = await fetchClient.get<{
            data: { imageUrl: string };
          }>("/api/users/me");
          useAuthStore
            .getState()
            .updateUserProfile({
              nickname: nicknameValue,
              imageUrl: profileRes.data.imageUrl,
            });
        } catch {
          useAuthStore
            .getState()
            .updateUserProfile({ nickname: nicknameValue });
        }
      } else {
        useAuthStore.getState().updateUserProfile({ nickname: nicknameValue });
      }
      onSave(nicknameValue);
      onClose();
    } catch (e) {
      console.error("프로필 저장 실패:", e);
      setNicknameMsg({
        text: "저장에 실패했어요. 다시 시도해주세요.",
        ok: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const nicknameUnchanged = nicknameValue === nickname;
  const canSave =
    nicknameValue.trim() &&
    !imageError &&
    (nicknameUnchanged || (nicknameChecked && nicknameMsg?.ok !== false));

  const displayImage = imagePreview ?? profileImageUrl ?? undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">
            프로필 편집
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center gap-2">
            <button
              className="relative group shrink-0"
              style={{ width: 80, height: 80 }}
              onClick={() => fileRef.current?.click()}
            >
              {/* 원형 클리핑 컨테이너 */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="프로필"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <Avatar name={nicknameValue} size={80} />
                )}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* 카메라 배지 */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#0046FF] rounded-full flex items-center justify-center border-2 border-white">
                <Camera size={11} className="text-white" />
              </div>
            </button>
            <p></p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">
              최대 2MB JPG, JPEG, PNG만 가능합니다.
            </p>
            {imageError && (
              <p className="text-[11px] text-red-500">{imageError}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* 닉네임 */}
          <div>
            <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400 mb-2">
              닉네임
            </p>
            <div className="flex gap-2">
              <input
                value={nicknameValue}
                onChange={(e) => handleNicknameChange(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-[#0046FF] transition-colors bg-white dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-slate-500"
                placeholder="닉네임을 입력해주세요"
              />
              <Button
                variant="basic"
                className="px-3 text-[12px] whitespace-nowrap"
                onClick={handleCheckNickname}
                disabled={checking}
              >
                {checking ? "확인 중" : "중복확인"}
              </Button>
            </div>
            {nicknameMsg && (
              <p
                className={`text-[12px] mt-1.5 ${nicknameMsg.ok ? "text-[#0046FF]" : "text-red-500"}`}
              >
                {nicknameMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 px-6 pb-6">
          <Button variant="invalid" className="flex-1 py-2.5" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1 py-2.5"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
