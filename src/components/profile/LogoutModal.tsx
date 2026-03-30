import { X } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-90 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">로그아웃</p>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium mb-1">로그아웃 하시겠어요?</p>
          <p className="text-[13px] text-gray-400 dark:text-slate-500">언제든지 다시 로그인할 수 있어요.</p>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <Button variant="invalid" className="flex-1 py-2.5" onClick={onClose}>취소</Button>
          <Button variant="primary" className="flex-1 py-2.5" onClick={onConfirm}>로그아웃</Button>
        </div>
      </div>
    </div>
  );
}
