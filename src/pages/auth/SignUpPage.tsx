import { useState, useCallback, useRef } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Logo from "@/components/ui/Logo";
import { authApi } from "@/api/authApi";

type EmailStep = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function SignUpPage() {
  const navigate = useNavigate();

  // ── 이메일 인증 ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // ── 닉네임 ──────────────────────────────────────────────────────────────────
  const [nickname, setNickname] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameHint, setNicknameHint] = useState("");

  // ── 비밀번호 ─────────────────────────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [confirmHint, setConfirmHint] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 토스트 ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: "", visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, visible: true });
    timerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3000,
    );
  }, []);

  const isFormValid =
    emailStep === "verified" &&
    nickname.trim() !== "" &&
    nicknameChecked &&
    password.length >= 8 &&
    password === passwordConfirm;

  // ── 이메일 유효성 ──────────────────────────────────────────────────────────
  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleEmailBlur = () => {
    if (!email) return;
    setEmailError(validateEmail(email) ? "" : "올바른 이메일 주소를 입력해 주세요.");
  };

  // ── 인증 메일 발송 — POST /api/auth/email/send ─────────────────────────────
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    setEmailError("");
    setEmailStep("sending");
    try {
      await authApi.sendEmailCode(email);
      setEmailStep("sent");
      showToast("인증 코드를 발송했습니다. 이메일을 확인해 주세요.");
    } catch {
      setEmailStep("idle");
      showToast("인증 메일 발송에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // ── 인증 코드 확인 — POST /api/auth/email/verify ──────────────────────────
  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) {
      setVerifyError("인증 코드를 입력해 주세요.");
      return;
    }
    setEmailStep("verifying");
    setVerifyError("");
    try {
      await authApi.verifyEmailCode(email, verifyCode);
      setEmailStep("verified");
      showToast("이메일 인증이 완료되었습니다.");
    } catch {
      setEmailStep("sent");
      setVerifyError("인증 코드가 올바르지 않습니다.");
    }
  };

  // ── 닉네임 중복 확인 — GET /api/auth/nickname/check ───────────────────────
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameChecked(false);
    setNicknameError("");
    setNicknameHint("");
  };

  const handleCheckNickname = async () => {
    const val = nickname.trim();
    if (val.length < 2 || val.length > 10) {
      setNicknameError("닉네임은 2~10자로 입력해 주세요.");
      setNicknameHint("");
      return;
    }
    setCheckingNickname(true);
    try {
      await authApi.checkNickname(val);
      setNicknameHint("사용 가능한 닉네임입니다.");
      setNicknameError("");
      setNicknameChecked(true);
    } catch {
      setNicknameError("이미 사용 중인 닉네임입니다.");
      setNicknameHint("");
      setNicknameChecked(false);
    } finally {
      setCheckingNickname(false);
    }
  };

  // ── 비밀번호 ─────────────────────────────────────────────────────────────────
  const handlePasswordBlur = () => {
    if (!password) return;
    setPasswordError(password.length < 8 ? "비밀번호는 8자 이상이어야 합니다." : "");
    if (passwordConfirm) validateConfirm(password, passwordConfirm);
  };

  const validateConfirm = (pw: string, cf: string) => {
    if (!cf) return;
    if (pw === cf) {
      setConfirmError("");
      setConfirmHint("비밀번호가 일치합니다.");
    } else {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      setConfirmHint("");
    }
  };

  const handleConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    validateConfirm(password, value);
  };

  // ── 회원가입 제출 — POST /api/auth/signup ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await authApi.signup({ email, nickname: nickname.trim(), password });
      showToast("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch {
      showToast("회원가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailVerified = emailStep === "verified";
  const emailSent = emailStep === "sent" || emailStep === "verifying";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-100">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
          {/* 로고 */}
          <div className="mb-7">
            <Logo appName="SOLMate" appSubtitle="모의투자를 통한 학습플랫폼" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* ── 이메일 + 인증 메일 발송 ──────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[14px] font-medium text-gray-700">이메일</label>
              <div className="flex gap-2 items-stretch">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    if (emailStep !== "idle") setEmailStep("idle");
                  }}
                  onBlur={handleEmailBlur}
                  placeholder="example@solmate.kr"
                  autoComplete="email"
                  disabled={emailVerified}
                  className={[
                    "flex-1 px-3 py-2.5 rounded-[10px] border outline-none",
                    "text-[16px] text-gray-900 placeholder:text-gray-400 transition-colors duration-150",
                    emailVerified ? "bg-gray-50 border-green-500 text-gray-500" :
                    emailError ? "border-red-400 focus:border-red-500" :
                    "border-gray-200 focus:border-[#0046FF]",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={emailVerified ? undefined : handleSendCode}
                  disabled={emailStep === "sending" || emailVerified}
                  className={[
                    "shrink-0 px-3.5 rounded-[10px] border text-[13px] font-medium",
                    "transition-all duration-150 whitespace-nowrap",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    emailVerified
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-[#0046FF] text-[#0046FF] hover:bg-blue-50",
                  ].join(" ")}
                >
                  {emailStep === "sending" ? "발송 중..." :
                   emailVerified ? "✓ 인증됨" :
                   emailSent ? "재발송" : "인증 발송"}
                </button>
              </div>
              {emailError && (
                <p className="text-[13px] text-red-500">{emailError}</p>
              )}
            </div>

            {/* ── 인증 코드 입력 (메일 발송 후 표시) ──────────────────────── */}
            {(emailSent || emailVerified) && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[14px] font-medium text-gray-700">인증 코드</label>
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => {
                      setVerifyCode(e.target.value);
                      setVerifyError("");
                    }}
                    placeholder="이메일로 받은 인증 코드 입력"
                    disabled={emailVerified}
                    className={[
                      "flex-1 px-3 py-2.5 rounded-[10px] border outline-none",
                      "text-[16px] text-gray-900 placeholder:text-gray-400 transition-colors duration-150",
                      emailVerified ? "bg-gray-50 border-green-500 text-gray-500" :
                      verifyError ? "border-red-400 focus:border-red-500" :
                      "border-gray-200 focus:border-[#0046FF]",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={emailVerified ? undefined : handleVerifyCode}
                    disabled={emailStep === "verifying" || emailVerified}
                    className={[
                      "shrink-0 px-3.5 rounded-[10px] border text-[13px] font-medium",
                      "transition-all duration-150 whitespace-nowrap",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      emailVerified
                        ? "border-green-500 text-green-600 bg-green-50"
                        : "border-[#0046FF] text-[#0046FF] hover:bg-blue-50",
                    ].join(" ")}
                  >
                    {emailStep === "verifying" ? "확인 중..." :
                     emailVerified ? "✓ 확인됨" : "코드 확인"}
                  </button>
                </div>
                {verifyError && (
                  <p className="text-[13px] text-red-500">{verifyError}</p>
                )}
              </div>
            )}

            {/* ── 닉네임 ────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[14px] font-medium text-gray-700">닉네임</label>
              <div className="flex gap-2 items-stretch">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="닉네임 입력 (2~10자)"
                  maxLength={10}
                  autoComplete="off"
                  className={[
                    "flex-1 px-3 py-2.5 rounded-[10px] border outline-none",
                    "text-[16px] text-gray-900 placeholder:text-gray-400 transition-colors duration-150",
                    nicknameError ? "border-red-400 focus:border-red-500" :
                    nicknameChecked ? "border-green-500 focus:border-green-500" :
                    "border-gray-200 focus:border-[#0046FF]",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={checkingNickname}
                  className={[
                    "shrink-0 px-3.5 rounded-[10px] border text-[13px] font-medium",
                    "transition-all duration-150 whitespace-nowrap",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    nicknameChecked
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-[#0046FF] text-[#0046FF] hover:bg-blue-50",
                  ].join(" ")}
                >
                  {checkingNickname ? "확인 중..." : nicknameChecked ? "✓ 확인됨" : "중복확인"}
                </button>
              </div>
              {nicknameError && (
                <p className="text-[13px] text-red-500">{nicknameError}</p>
              )}
              {nicknameHint && !nicknameError && (
                <p className="text-[13px] text-green-600">{nicknameHint}</p>
              )}
            </div>

            {/* ── 비밀번호 ──────────────────────────────────────────────────── */}
            <div className="relative">
              <Input
                label="비밀번호"
                type={showPw ? "text" : "password"}
                value={password}
                placeholder="8자 이상 입력"
                autoComplete="new-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onBlur={handlePasswordBlur}
                error={passwordError}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label="비밀번호 표시"
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ── 비밀번호 확인 ─────────────────────────────────────────────── */}
            <div className="relative">
              <Input
                label="비밀번호 확인"
                type={showPwConfirm ? "text" : "password"}
                value={passwordConfirm}
                placeholder="비밀번호 재입력"
                autoComplete="new-password"
                onChange={(e) => handleConfirmChange(e.target.value)}
                error={confirmError}
                hint={confirmHint}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPwConfirm((v) => !v)}
                aria-label="비밀번호 확인 표시"
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPwConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ── 회원가입 버튼 ─────────────────────────────────────────────── */}
            <Button
              type="submit"
              variant={isFormValid ? "primary" : "invalid"}
              className={[
                "w-full py-3 text-[15px] font-semibold mt-1",
                !isFormValid || isSubmitting ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  처리 중...
                </span>
              ) : (
                "회원가입"
              )}
            </Button>
          </form>

          {/* 로그인 안내 */}
          <p className="mt-6 text-center text-[13px] text-gray-400">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#0046FF] font-medium hover:underline"
            >
              로그인
            </button>
          </p>
        </div>
      </div>

      {/* ── 토스트 ── */}
      <div
        className={[
          "fixed bottom-8 left-1/2 -translate-x-1/2",
          "bg-gray-800 text-white text-[13px] px-5 py-2.5",
          "rounded-lg pointer-events-none whitespace-nowrap z-50",
          "transition-all duration-200",
          toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        ].join(" ")}
      >
        {toast.msg}
      </div>
    </div>
  );
}
