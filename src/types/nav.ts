import type { LucideIcon } from "lucide-react";

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
    avatarColor?: string;
  };
  onLogout?: () => void;
};
