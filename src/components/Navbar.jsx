import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react";
import logo from "../assets/synde_logo.svg";
import ConfirmationModal from "./dashboard/ConfirmationModal";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setIsUserMenuOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentLang = i18n.language.startsWith("vi") ? "vi" : "en";
  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <img src={logo} alt="SynDe Logo" className="h-10 w-auto" />
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition font-medium cursor-pointer">
            {t("nav.home")}
          </button>
          <button onClick={() => navigate("/quizzes")} className="text-muted-foreground hover:text-foreground transition font-medium cursor-pointer">
            {t("nav.quizzes")}
          </button>
          <button
            onClick={() => navigate("/lookup")}
            className="text-muted-foreground hover:text-foreground transition font-medium cursor-pointer"
          >
            {t("lookup.title")}
          </button>
          
          {/* More Dropdown */}
          <div className="relative group/more">
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition font-medium cursor-pointer">
              {t("common.more") || "Thêm"}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all p-2 z-50">
              <button onClick={() => navigate("/weekly")} className="w-full text-left px-4 py-2 hover:bg-primary/5 rounded-xl text-sm font-medium transition-colors">
                {t("nav.weekly")}
              </button>
              <button onClick={() => navigate("/rewards")} className="w-full text-left px-4 py-2 hover:bg-primary/5 rounded-xl text-sm font-medium transition-colors">
                {t("nav.rewards")}
              </button>
              <div className="h-px bg-border/50 my-1" />
              <button onClick={() => navigate("/intro")} className="w-full text-left px-4 py-2 hover:bg-primary/5 rounded-xl text-sm font-medium transition-colors">
                {t("nav.about")}
              </button>
              <button onClick={() => navigate("/about")} className="text-left w-full px-4 py-2 hover:bg-primary/5 rounded-xl text-sm font-medium transition-colors">
                {t("nav.aboutUs")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-border/30 p-1 rounded-full relative border border-border/50">
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
              className={`relative z-10 w-9 h-7 flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                currentLang === "vi" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              VI
            </button>
            <button
              onClick={() => toggleLanguage("en")}
              className={`relative z-10 w-9 h-7 flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                currentLang === "en" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>

          {localStorage.getItem("token") && localStorage.getItem("user") ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="max-w-[100px] truncate">{user.fullName || t("dashboard.header.account")}</span>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border/50 mb-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                          {t("dashboard.header.account")}
                        </p>
                        <p className="text-sm font-bold truncate text-foreground">{user.email}</p>
                      </div>

                      <button
                        onClick={() => { navigate("/dashboard"); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-border/50 group-hover:bg-primary/20 transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        {t("dashboard.sidebar.overview")}
                      </button>

                      <button
                        onClick={() => { navigate("/dashboard/profile"); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-border/50 group-hover:bg-primary/20 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        {t("dashboard.sidebar.profile")}
                      </button>

                      <button
                        onClick={() => { navigate("/dashboard/settings"); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-border/50 group-hover:bg-primary/20 transition-colors">
                          <Settings className="w-4 h-4" />
                        </div>
                        {t("dashboard.sidebar.settings")}
                      </button>

                      <div className="h-px bg-border/50 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                      >
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <LogOut className="w-4 h-4" />
                        </div>
                        {t("dashboard.sidebar.logout")}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="px-6 py-2 text-foreground hover:text-primary transition border border-primary rounded-lg font-medium">
                {t("nav.signIn")}
              </button>
              <button onClick={() => navigate("/register")} className="px-6 py-2 bg-primary text-white border-2 border-primary rounded-lg font-medium hover:opacity-90 transition">
                {t("nav.register")}
              </button>
            </>
          )}
        </div>
      
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title={t("dashboard.sidebar.logout")}
        message={t("dashboard.sidebar.logoutConfirm")}
        confirmText={t("dashboard.sidebar.logout")}
        type="danger"
      />
      </div>
    </nav>
  );
}
