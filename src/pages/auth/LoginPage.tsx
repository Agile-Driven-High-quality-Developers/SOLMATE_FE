import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Logo from "@/components/ui/Logo";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";

export interface LoginForm {
  email: string;
  password: string;
  autoLogin: boolean;
}

// ─── Google 로고 ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C18.622 13.075 17.64 11.3 17.64 9.2z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    autoLogin: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const setField = <K extends keyof LoginForm>(key: K, value: LoginForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isFormValid = form.email.trim() !== "" && form.password !== "";

  // POST /api/auth/login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { data } = await authApi.login({
        email: form.email,
        password: form.password,
      });
      setAuth(data.data.accessToken, { nickname: data.data.nickname });
      navigate("/");
    } catch {
      setErrorMsg("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // GET /api/auth/google/authorize-uri → 리디렉션
  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const { data } = await authApi.getGoogleAuthorizeUri();
      window.location.href = data.data.authorizeUri;
    } catch {
      setErrorMsg("구글 로그인을 시작할 수 없습니다. 다시 시도해 주세요.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-100">
        {/* ── 카드 ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
          {/* 로고 */}
          <div className="mb-7">
            <Logo appName="SOLMate" appSubtitle="모의투자를 통한 학습플랫폼" />
          </div>
          {/* 헤드라인 */}
          <div className="mb-7">
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              다시 만나서 반가워요 👋
            </h1>
            <p className="mt-1.5 text-[14px] text-gray-400">
              함께 성장하는 모의투자 커뮤니티
            </p>
          </div>

          {/* 폼 */}
          <form
            onSubmit={handleEmailLogin}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* 이메일 */}
            <Input
              label="이메일"
              type="email"
              value={form.email}
              placeholder="example@solmate.kr"
              autoComplete="email"
              onChange={(e) => {
                setField("email", e.target.value);
                setErrorMsg("");
              }}
            />

            {/* 비밀번호 */}
            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                onChange={(e) => {
                  setField("password", e.target.value);
                  setErrorMsg("");
                }}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-[13px] text-red-500 -mt-1">{errorMsg}</p>
            )}

            {/* 자동 로그인 / 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.autoLogin}
                  onChange={(e) => setField("autoLogin", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#0046FF] cursor-pointer"
                />
                <span className="text-[13px] text-gray-500">자동 로그인</span>
              </label>

              <button
                type="button"
                className="text-[13px] text-gray-400 hover:text-[#0046FF] transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              variant={isFormValid ? "primary" : "invalid"}
              className={[
                "w-full py-3 text-[15px] font-semibold mt-1",
                !isFormValid || isLoading ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  잠시만요...
                </span>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[12px] text-gray-300 tracking-wider">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google 로그인 — GET /api/auth/google/authorize-uri */}
          <Button
            variant="basic"
            className="w-full py-3 text-[14px] font-medium flex items-center justify-center gap-2.5"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google로 계속하기
          </Button>

          {/* 회원가입 안내 */}
          <p className="mt-6 text-center text-[13px] text-gray-400">
            아직 계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-[#0046FF] font-medium hover:underline"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
