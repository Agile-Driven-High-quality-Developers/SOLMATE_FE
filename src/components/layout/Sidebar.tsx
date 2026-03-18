import { useLocation, useNavigate } from "react-router-dom";
import type { NavItemConfig, SidebarNavProps } from "../../types/nav";
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
  TrendingUp,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

const NAV_ITEMS: NavItemConfig[] = [
  { id: "home", label: "홈", icon: Home, href: "/" },
  { id: "invest", label: "모의투자", icon: BarChart2, href: "/invest" },
  { id: "account", label: "내 계좌", icon: Wallet, href: "/account" },
  { id: "trade", label: "매매일지", icon: BookOpen, href: "/trade" },
  { id: "users", label: "유저 목록", icon: Users, href: "/users" },
  { id: "alarm", label: "알림", icon: Bell, href: "/alarm", badge: 3 },
  { id: "mentor", label: "나의 멘토", icon: GraduationCap, href: "/mentor" },
  { id: "mentee", label: "나의 멘티", icon: UserCheck, href: "/mentee" },
  { id: "profile", label: "프로필", icon: UserCircle, href: "/profile" },
];

// ────────────────────────────────────────────────────────────
// AppLogo
// ────────────────────────────────────────────────────────────
function AppLogo({
  appName,
  appSubtitle,
}: {
  appName: string;
  appSubtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-2">
      <div className="w-9 h-9 rounded-[10px] bg-[#0046FF] flex items-center justify-center shrink-0">
        <TrendingUp className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-gray-900 leading-tight truncate">
          {appName}
        </p>
        <p className="text-[12px] text-gray-400 mt-px truncate">
          {appSubtitle}
        </p>
      </div>
    </div>
  );
}

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
  const initials = user.name.slice(0, 1);
  const isPositive = user.returnRate.startsWith("+");

  return (
    <div className="px-4 pt-3 border-t border-gray-100 mt-2">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: user.avatarColor ?? "#0046FF" }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-gray-900 truncate">
            {user.name}
          </p>
          <p
            className={[
              "text-[13px] font-medium mt-px",
              isPositive ? "text-red-500" : "text-green-600",
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
    NAV_ITEMS.find((item) => item.href === pathname)?.id ?? "home";

  // user 정보는 나중에 zustand로 → 일단 하드코딩
  const user = {
    name: "투자왕김철수",
    returnRate: "+12.5%",
    avatarColor: "#0046FF",
  };

  return (
    <nav className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col py-5 shrink-0">
      <AppLogo appName="SOLMate" appSubtitle="모의투자를 통한 학습플랫폼" />
      <div className="mx-4 my-3 h-px bg-gray-100" />
      <ul className="flex flex-col gap-0.5 px-2.5 list-none">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            onClick={() => navigate(item.href)}
          />
        ))}
      </ul>

      <div className="flex-1" />
      {user && <UserProfile user={user} onLogout={() => navigate("/login")} />}
    </nav>
  );
}
