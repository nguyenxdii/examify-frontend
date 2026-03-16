import { Bell, Search, User, ChevronDown, Settings, LogOut, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function DashboardHeader({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentLang = i18n.language.startsWith("vi") ? "vi" : "en";

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Page Title or Breadcrumb could go here */}
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {t("dashboard.header.welcome")}{" "}
              <span className="text-primary">{user?.fullName || "User"}</span>!
            </h2>
            <p className="text-xs text-muted-foreground">{t("dashboard.header.overviewDesc")}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Language Switcher Pill Styled */}
        <div className="flex bg-border/30 p-1 rounded-full relative border border-border/50 h-9">
          <motion.div
            className="absolute inset-y-1 bg-primary rounded-full shadow-lg z-0"
            initial={false}
            animate={{
              x: currentLang === "vi" ? 0 : 36,
              width: 36,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => toggleLanguage("vi")}
            className={`relative z-10 w-9 h-7 flex items-center justify-center text-[10px] font-bold transition-colors duration-200 ${
              currentLang === "vi" ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            VI
          </button>
          <button
            onClick={() => toggleLanguage("en")}
            className={`relative z-10 w-9 h-7 flex items-center justify-center text-[10px] font-bold transition-colors duration-200 ${
              currentLang === "en" ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EN
          </button>
        </div>

        {/* Notifications */}
        <button className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-primary relative group border border-transparent hover:border-border">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pl-3 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">{user?.fullName}</p>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tight">{user?.role?.replace('ROLE_', '')}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-primary/20 to-purple-600/20 border border-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showProfileMenu && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-0" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-border/50 mb-1">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{t("dashboard.header.account")}</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors group">
                    <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {t("dashboard.sidebar.profile")}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors group">
                    <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    {t("dashboard.sidebar.settings")}
                  </button>
                  <div className="h-px bg-border/50 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors group"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    {t("dashboard.header.signOut")}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// Helper function locally if needed or import
function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
