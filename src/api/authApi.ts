import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true, // refreshToken 쿠키 자동 포함
});

// ─── Request / Response Types ──────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
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
    api.post<ApiResponse<LoginData>>("/api/auth/login", data),

  /** POST /api/auth/signup */
  signup: (data: SignUpRequest) => api.post("/api/auth/signup", data),

  /** POST /api/auth/email/send — 인증 메일 발송 */
  sendEmailCode: (email: string) => api.post("/api/auth/email/send", { email }),

  /** POST /api/auth/email/verify — 이메일 인증 코드 확인 */
  verifyEmailCode: (email: string, emailVerificationCode: string) =>
    api.post("/api/auth/email/verify", { email, emailVerificationCode }),

  /** GET /api/auth/nickname/check — 닉네임 중복 확인 */
  checkNickname: (nickname: string) =>
    api.get("/api/auth/nickname/check", { params: { nickname } }),

  /** GET /api/auth/google/authorize-uri — 구글 로그인 URL 조회 */
  getGoogleAuthorizeUri: () =>
    api.get<ApiResponse<{ authorizeUri: string }>>("/api/auth/google/authorize-uri"),

  /** GET /api/auth/google/callback — 구글 로그인 콜백 처리 */
  googleCallback: (code: string) =>
    api.get<ApiResponse<LoginData>>("/api/auth/google/callback", { params: { code } }),

  /** POST /api/auth/logout */
  logout: () => api.post("/api/auth/logout"),

  /** POST /api/auth/reissue — 토큰 재발급 */
  reissue: () => api.post<{ accessToken: string }>("/api/auth/reissue"),
};
