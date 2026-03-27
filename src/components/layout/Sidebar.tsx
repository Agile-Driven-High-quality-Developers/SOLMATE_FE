import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  BarChart2,
  Wallet,
  BookOpen,
  Users,
  Bell,
  GraduationCap,
  UserCheck,
  UserCircle,
  LogOut,
  Receipt,
  BookMarked,
} from "lucide-react";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import { useUnreadCountQuery } from "@/api/notificationApi";
import { useMyProfileQuery } from "@/api/userListApi";
import { useAccountSummaryQuery } from "@/api/accountSummaryApi";

export type NavItemConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href: string;
};

export type SidebarNavProps = {
  appName?: string;
  appSubtitle?: string;
  navItems: NavItemConfig[];
  activeId: string;
  onNavChange: (id: string) => void;
  user?: {
    name: string;
    returnRate: string;
    imageUrl?: string;
  };
  onLogout?: () => void;
};

const NAV_ITEMS: NavItemConfig[] = [
  { id: "home", label: "홈", icon: Home, href: "/" },
  { id: "invest", label: "모의투자", icon: BarChart2, href: "/invest" },
  { id: "account", label: "내 계좌", icon: Wallet, href: "/account" },
  { id: "trade", label: "매매일지", icon: BookOpen, href: "/trade-diary" },
  { id: "users", label: "유저 목록", icon: Users, href: "/users" },
  { id: "notifications", label: "알림", icon: Bell, href: "/notifications" },
  { id: "mentor", label: "나의 멘토", icon: GraduationCap, href: "/mentor" },
  { id: "mentee", label: "나의 멘티", icon: UserCheck, href: "/mentee" },
  { id: "profile", label: "프로필", icon: UserCircle, href: "/profile" },
  { id: "guide", label: "가이드", icon: BookMarked, href: "/guide" },
  {
    id: "shinhan",
    label: "실전투자 바로가기",
    icon: Receipt,
    href: "https://www.shinhansec.com/siw/customer-center/channel/channel_webTrading/contents.do",
  },
];

// ────────────────────────────────────────────────────────────
// NavItem
// ────────────────────────────────────────────────────────────
function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItemConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={onClick}
        data-tour={
          ["invest", "account", "trade", "users", "mentor", "profile", "guide"].includes(
            item.id,
          )
            ? `nav-${item.id}`
            : undefined
        }
        className={[
          "relative w-full flex items-center gap-2.5 px-3 py-2.25 rounded-[10px]",
          "text-left transition-colors duration-150 group cursor-pointer",
          isActive
            ? "bg-[#0046FF] text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        ].join(" ")}
      >
        {/* 활성 인디케이터 바 */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-[60%] rounded-r-full bg-white/50" />
        )}

        {/* 아이콘 */}
        <Icon
          className={[
            "w-4 h-4 shrink-0 transition-colors duration-150",
            isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600",
          ].join(" ")}
        />

        {/* 레이블 */}
        <span
          className={[
            "text-[15px] flex-1 transition-all duration-150",
            isActive ? "font-semibold" : "font-normal",
          ].join(" ")}
        >
          {item.label}
        </span>

        {/* 알림 뱃지 */}
        {item.badge != null && item.badge > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[12px] font-bold flex items-center justify-center leading-none">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </button>
    </li>
  );
}

// ────────────────────────────────────────────────────────────
// UserProfile
// ────────────────────────────────────────────────────────────
function UserProfile({
  user,
  onLogout,
}: {
  user: NonNullable<SidebarNavProps["user"]>;
  onLogout?: () => void;
}) {
  const isPositive = user.returnRate.startsWith("+");
  const isNegative = user.returnRate.startsWith("-");

  return (
    <div className="px-4 pt-3 border-t border-gray-100 mt-2">
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar name={user.name} src={user.imageUrl || undefined} size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-gray-900 truncate">
            {user.name}
          </p>
          <p
            className={[
              "text-[13px] font-medium mt-px",
              isPositive
                ? "text-red-500"
                : isNegative
                  ? "text-blue-500"
                  : "text-gray-400",
            ].join(" ")}
          >
            {user.returnRate}
          </p>
        </div>
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors py-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          로그아웃
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SidebarNav
// ────────────────────────────────────────────────────────────
export default function SidebarNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeId =
    NAV_ITEMS.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href),
    )?.id ??
    (pathname === "/" ? "home" : undefined) ??
    "home";

  const queryClient = useQueryClient();
  const storeUser = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile);
  const { data: unreadCount } = useUnreadCountQuery();
  const { data: myProfile } = useMyProfileQuery();
  const { data: accountSummary } = useAccountSummaryQuery();

  // myProfile이 도착하면 sessionStorage에 동기화 → 다음 새로고침 시 깜빡임 방지
  useEffect(() => {
    if (myProfile) {
      updateUserProfile({
        nickname: myProfile.nickname,
        imageUrl: myProfile.imageUrl,
      });
    }
  }, [myProfile, updateUserProfile]);

  const returnRate = accountSummary
    ? `${accountSummary.totalReturnRate >= 0 ? "+" : ""}${accountSummary.totalReturnRate.toFixed(1)}%`
    : "-";

  const user = storeUser
    ? {
        name: storeUser.nickname,
        returnRate,
        // store에 캐시된 imageUrl 우선 → API 응답 도착 전에도 깜빡임 없음
        imageUrl: storeUser.imageUrl,
      }
    : null;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      queryClient.clear();
      navigate("/login");
    }
  };

  const navItems = NAV_ITEMS.map((item) =>
    item.id === "notifications"
      ? { ...item, badge: unreadCount?.total ?? 0 }
      : item,
  );

  return (
    <nav className="w-64 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col py-5 shrink-0 overflow-y-auto">
      <div className="px-4 pb-2">
        <button
          onClick={() => navigate("/")}
          className="w-full text-left cursor-pointer"
        >
          <Logo appName="SOLMate" appSubtitle="모의투자를 통한 학습플랫폼" />
        </button>
      </div>
      <div className="mx-4 my-3 h-px bg-gray-100" />
      <ul className="flex flex-col gap-0.5 px-2.5 list-none">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            onClick={() =>
              item.id === "shinhan"
                ? window.open(item.href, "_blank")
                : navigate(item.href)
            }
          />
        ))}
      </ul>

      <div className="flex-1" />
      {user && <UserProfile user={user} onLogout={handleLogout} />}
    </nav>
  );
}
