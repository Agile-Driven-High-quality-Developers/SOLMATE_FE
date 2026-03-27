import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    console.log("[OAuth] code:", code);
    if (!code) {
      console.warn("[OAuth] code 없음 → 로그인 페이지로");
      navigate("/login", { replace: true });
      return;
    }

    authApi
      .googleCallback(code)
      .then((res) => {
        console.log("[OAuth] 응답:", res);
        setAuth(res.data.accessToken, { nickname: res.data.nickname, provider: "GOOGLE" });
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("[OAuth] 에러:", err.message);
        const code = (err?.data as { code?: string; message?: string })?.code;
        const message =
          code === "USER_409_1"
            ? (err.data as { message: string }).message
            : "구글 로그인에 실패했습니다. 다시 시도해 주세요.";
        navigate("/login", { replace: true, state: { errorMsg: message } });
      });
  }, [navigate, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#0046FF]" />
    </div>
  );
}
