import { fetchClient, reissueToken } from "@/lib/fetchClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  nickname: string;
  accessToken: string;
  refreshToken: string;
}

export interface SignUpRequest {
  email: string;
  nickname: string;
  password: string;
}

// ─── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/login */
  login: (data: LoginRequest) =>
    fetchClient.post<ApiResponse<LoginData>>("/api/auth/login", data),

  /** POST /api/auth/signup */
  signup: (data: SignUpRequest) =>
    fetchClient.post<ApiResponse<void>>("/api/auth/signup", data),

  /** POST /api/auth/email/send — 인증 메일 발송 */
  sendEmailCode: (email: string) =>
    fetchClient.post<ApiResponse<void>>("/api/auth/email/send", { email }),

  /** POST /api/auth/email/verify — 이메일 인증 코드 확인 */
  verifyEmailCode: (email: string, emailVerificationCode: string) =>
    fetchClient.post<ApiResponse<void>>("/api/auth/email/verify", { email, emailVerificationCode }),

  /** GET /api/auth/nickname/check — 닉네임 중복 확인 */
  checkNickname: (nickname: string) =>
    fetchClient.get<ApiResponse<void>>("/api/auth/nickname/check", { nickname }),

  /** GET /api/auth/google/authorize-uri — 구글 로그인 URL 조회 */
  getGoogleAuthorizeUri: () =>
    fetchClient.get<ApiResponse<{ authorizeUri: string }>>("/api/auth/google/authorize-uri"),

  /** GET /api/auth/google/callback — 구글 로그인 콜백 처리 */
  googleCallback: (code: string) =>
    fetchClient.get<ApiResponse<LoginData>>("/api/auth/google/callback", { code }),

  /** POST /api/auth/logout */
  logout: () => fetchClient.post<ApiResponse<void>>("/api/auth/logout"),

  /** POST /api/auth/reissue — 토큰 재발급 */
  reissue: reissueToken,

  /** GET /api/users/me — 내 정보 조회 */
  getMe: () =>
    fetchClient.get<ApiResponse<{ nickname: string; provider: "EMAIL" | "GOOGLE" }>>("/api/users/me"),
};
