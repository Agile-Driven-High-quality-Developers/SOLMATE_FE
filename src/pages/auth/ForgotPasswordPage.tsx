import { useState, useCallback, useRef, useEffect } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Logo from "@/components/ui/Logo";
import { authApi } from "@/api/authApi";

type EmailStep = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // 항상 라이트 모드
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    return () => {
      if (isDark) document.documentElement.classList.add("dark");
    };
  }, []);

  // ── 이메일 인증 ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // ── 새 비밀번호 ──────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [confirmHint, setConfirmHint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

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

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const emailVerified = emailStep === "verified";
  const emailSent = emailStep === "sent" || emailStep === "verifying";

  const isFormValid =
    emailVerified &&
    newPassword.length >= 8 &&
    newPassword === newPasswordConfirm;

  // ── 인증 메일 발송 — POST /api/auth/password/email/send ───────────────────
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    setEmailError("");
    setEmailStep("sending");
    try {
      await authApi.sendPasswordResetEmail(email);
      setEmailStep("sent");
      showToast("인증 코드를 발송했습니다. 이메일을 확인해 주세요.");
    } catch (err: unknown) {
      setEmailStep("idle");
      const e = err as { data?: { message?: string } };
      if (e.data?.message) {
        setEmailError(e.data.message);
      } else {
        showToast("인증 메일 발송에 실패했습니다. 다시 시도해 주세요.");
      }
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

  // ── 비밀번호 유효성 ───────────────────────────────────────────────────────
  const handlePasswordBlur = () => {
    if (!newPassword) return;
    setPasswordError(
      newPassword.length < 8 ? "비밀번호는 8자 이상이어야 합니다." : "",
    );
    if (newPasswordConfirm) validateConfirm(newPassword, newPasswordConfirm);
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
    setNewPasswordConfirm(value);
    validateConfirm(newPassword, value);
  };

  // ── 비밀번호 재설정 — POST /api/auth/password/reset ──────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ email, newPassword });
      setIsDone(true);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      if (e.data?.message) {
        showToast(e.data.message);
      } else {
        showToast("비밀번호 재설정에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-100">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
          {/* 로고 */}
          <div className="mb-7">
            <Logo appName="SOLMate" appSubtitle="모의투자를 통한 학습플랫폼" />
          </div>

          {isDone ? (
            /* ── 완료 화면 ── */
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0046FF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[18px] font-semibold text-gray-900">
                  비밀번호가 변경되었습니다
                </p>
                <p className="mt-1.5 text-[13px] text-gray-400">
                  새 비밀번호로 로그인해 주세요.
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full py-3 text-[16px] font-semibold mt-2"
                onClick={() => navigate("/login")}
              >
                로그인하러 가기
              </Button>
            </div>
          ) : (
            <>
              {/* 헤드라인 */}
              <div className="mb-7">
                <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
                  비밀번호 찾기
                </h1>
                <p className="mt-1.5 text-[14px] text-gray-400">
                  가입한 이메일로 인증 후 비밀번호를 재설정할 수 있어요.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                {/* ── 이메일 + 인증 메일 발송 ────────────────────────────── */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[14px] font-medium text-gray-700">
                    이메일
                  </label>
                  <div className="flex flex-col min-[480px]:flex-row gap-2 items-stretch">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        if (emailStep !== "idle") setEmailStep("idle");
                      }}
                      onBlur={() => {
                        if (!email) return;
                        setEmailError(
                          validateEmail(email)
                            ? ""
                            : "올바른 이메일 주소를 입력해 주세요.",
                        );
                      }}
                      placeholder="example@solmate.kr"
                      autoComplete="email"
                      disabled={emailVerified}
                      className={[
                        "flex-1 px-3 py-2.5 rounded-[10px] border outline-none",
                        "text-[16px] text-gray-900 placeholder:text-gray-400 transition-colors duration-150",
                        emailVerified
                          ? "bg-gray-50 border-green-500 text-gray-500"
                          : emailError
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-200 focus:border-[#0046FF]",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={emailVerified ? undefined : handleSendCode}
                      disabled={emailStep === "sending" || emailVerified}
                      className={[
                        "shrink-0 px-3.5 py-1.5 rounded-[10px] border text-[12px] font-medium",
                        "transition-all duration-150 whitespace-nowrap",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        emailVerified
                          ? "border-green-500 text-green-600 bg-green-50"
                          : "border-[#0046FF] text-[#0046FF] hover:bg-blue-50",
                      ].join(" ")}
                    >
                      {emailStep === "sending"
                        ? "발송 중..."
                        : emailVerified
                          ? "✓ 인증됨"
                          : emailSent
                            ? "재발송"
                            : "인증 발송"}
                    </button>
                  </div>
                  {emailError && (
                    <p className="text-[12px] text-red-500">{emailError}</p>
                  )}
                </div>

                {/* ── 인증 코드 입력 (메일 발송 후 표시) ──────────────────── */}
                {(emailSent || emailVerified) && (
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[14px] font-medium text-gray-700">
                      인증 코드
                    </label>
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
                          emailVerified
                            ? "bg-gray-50 border-green-500 text-gray-500"
                            : verifyError
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-200 focus:border-[#0046FF]",
                        ].join(" ")}
                      />
                      <button
                        type="button"
                        onClick={emailVerified ? undefined : handleVerifyCode}
                        disabled={emailStep === "verifying" || emailVerified}
                        className={[
                          "shrink-0 px-3.5 rounded-[10px] border text-[12px] font-medium",
                          "transition-all duration-150 whitespace-nowrap",
                          "disabled:opacity-60 disabled:cursor-not-allowed",
                          emailVerified
                            ? "border-green-500 text-green-600 bg-green-50"
                            : "border-[#0046FF] text-[#0046FF] hover:bg-blue-50",
                        ].join(" ")}
                      >
                        {emailStep === "verifying"
                          ? "확인 중..."
                          : emailVerified
                            ? "✓ 확인됨"
                            : "코드 확인"}
                      </button>
                    </div>
                    {verifyError && (
                      <p className="text-[12px] text-red-500">{verifyError}</p>
                    )}
                  </div>
                )}

                {/* ── 새 비밀번호 (이메일 인증 완료 후 표시) ──────────────── */}
                {emailVerified && (
                  <>
                    <div className="relative">
                      <Input
                        label="새 비밀번호"
                        type={showPw ? "text" : "password"}
                        value={newPassword}
                        placeholder="8자 이상 입력"
                        autoComplete="new-password"
                        onChange={(e) => {
                          setNewPassword(e.target.value);
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

                    <div className="relative">
                      <Input
                        label="새 비밀번호 확인"
                        type={showPwConfirm ? "text" : "password"}
                        value={newPasswordConfirm}
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
                        {showPwConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      variant={isFormValid ? "primary" : "invalid"}
                      className={[
                        "w-full py-3 text-[16px] font-semibold mt-1",
                        !isFormValid || isSubmitting
                          ? "cursor-not-allowed opacity-60"
                          : "",
                      ].join(" ")}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          처리 중...
                        </span>
                      ) : (
                        "비밀번호 변경"
                      )}
                    </Button>
                  </>
                )}
              </form>

              {/* 로그인으로 돌아가기 */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 flex items-center gap-1.5 mx-auto text-[12px] text-gray-400 hover:text-[#0046FF] transition-colors"
              >
                <ArrowLeft size={13} />
                로그인으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 토스트 ── */}
      <div
        className={[
          "fixed bottom-8 left-1/2 -translate-x-1/2",
          "bg-gray-800 text-white text-[12px] px-5 py-2.5",
          "rounded-lg pointer-events-none whitespace-nowrap z-50",
          "transition-all duration-200",
          toast.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4",
        ].join(" ")}
      >
        {toast.msg}
      </div>
    </div>
  );
}
