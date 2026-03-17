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
  Database,
  Award,
  MessageSquare,
  Zap
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/synde_logo.svg";

export function Sidebar({ role }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  const getIsAdmin = (r) => {
    if (!r) return false;
    if (Array.isArray(r)) return r.some(item => String(item).toUpperCase().includes("ADMIN"));
    return String(r).toUpperCase().includes("ADMIN");
  };

  const isAdmin = getIsAdmin(role);


  const menuItems = isAdmin
    ? [
        {
          id: "/dashboard/admin",
          label: t("dashboard.sidebar.overview"),
          icon: LayoutDashboard,
        },
        {
          id: "/dashboard/admin/users",
          label: t("dashboard.sidebar.users"),
          icon: Users,
        },
        {
          id: "/dashboard/admin/all-quizzes",
          label: t("dashboard.sidebar.allQuizzes"),
          icon: BookOpen,
        },
        {
          id: "/dashboard/admin/analytics",
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
          id: "/dashboard/teacher/my-quizzes",
          label: t("dashboard.sidebar.myQuizzes"),
          icon: BookOpen,
        },
        {
          id: "/dashboard/teacher/create-quiz",
          label: t("dashboard.sidebar.createQuiz"),
          icon: PlusCircle,
        },
        {
          id: "/dashboard/teacher/rooms",
          label: t("dashboard.sidebar.rooms"),
          icon: Users,
        },
        {
          id: "/dashboard/teacher/questions",
          label: t("dashboard.sidebar.questions"),
          icon: Database,
        },
        {
          id: "/dashboard/teacher/results",
          label: t("dashboard.sidebar.results"),
          icon: Award,
        },
        {
          id: "/dashboard/teacher/ai-assistant",
          label: t("dashboard.sidebar.aiAssistant"),
          icon: MessageSquare,
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
          className="flex items-center gap-2 cursor-pointer group opacity-90 hover:opacity-100 transition-opacity"
          onClick={() => navigate("/dashboard")}
        >
          <img src={logo} alt="SynDe Logo" className="h-10 w-auto" />
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

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
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
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative mb-1",
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
          </motion.div>
        </AnimatePresence>
      </nav>

      {/* Logout & Settings Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
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
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}
