import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  Cog,
  LogOut,
  Search,
  PlusCircle,
  BarChart3,
  UserCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export function Sidebar({ role }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  const isAdmin = role === "ROLE_ADMIN";

  const menuItems = isAdmin
    ? [
        {
          id: "/dashboard/admin",
          label: t("dashboard.sidebar.overview"),
          icon: LayoutDashboard,
        },
        {
          id: "/dashboard/users",
          label: t("dashboard.sidebar.users"),
          icon: Users,
        },
        {
          id: "/dashboard/all-quizzes",
          label: t("dashboard.sidebar.allQuizzes"),
          icon: BookOpen,
        },
        {
          id: "/dashboard/analytics",
          label: t("dashboard.sidebar.analytics"),
          icon: BarChart3,
        },
      ]
    : [
        {
          id: "/dashboard/user",
          label: t("dashboard.sidebar.overview"),
          icon: LayoutDashboard,
        },
        {
          id: "/dashboard/my-quizzes",
          label: t("dashboard.sidebar.myQuizzes"),
          icon: BookOpen,
        },
        {
          id: "/dashboard/create-quiz",
          label: t("dashboard.sidebar.createQuiz"),
          icon: PlusCircle,
        },
        {
          id: "/dashboard/students",
          label: t("dashboard.sidebar.students"),
          icon: Users,
        },
      ];

  const settingsItems = [
    {
      id: "/dashboard/settings",
      label: t("dashboard.sidebar.settings"),
      icon: Cog,
    },
    {
      id: "/dashboard/profile",
      label: t("dashboard.sidebar.profile"),
      icon: UserCircle,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div
          className="flex items-center gap-2 cursor-pointer group opacity-80 hover:opacity-100 transition-opacity"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600/50 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/20 border border-white/20">
            S
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600/60 bg-clip-text text-transparent">
            SynDe
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t("dashboard.header.search")}
            className="w-full pl-9 pr-3 py-2 bg-background border border-sidebar-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.2em] px-4 mb-2">
          {isAdmin
            ? t("dashboard.sidebar.adminMenu")
            : t("dashboard.sidebar.userMenu")}
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                navigate(item.id);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-primary",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-white"
                    : "group-hover:scale-110 transition-transform",
                )}
              />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout & Settings Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-primary",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {t("dashboard.sidebar.logout")}
        </button>
      </div>
    </aside>
  );
}
