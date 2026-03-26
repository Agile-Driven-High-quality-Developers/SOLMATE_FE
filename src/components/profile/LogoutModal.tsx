import Button from "@/components/ui/Button";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl w-80 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <p className="text-[15px] font-bold text-gray-900 mb-2">로그아웃</p>
          <p className="text-[13px] text-gray-400">정말 로그아웃 하시겠습니까?</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>취소</Button>
          <Button variant="primary" className="flex-1" onClick={onConfirm}>로그아웃</Button>
        </div>
      </div>
    </div>
  );
}
