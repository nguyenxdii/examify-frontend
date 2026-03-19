import {
  Bell,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import axiosInstance from "../../api/axiosInstance";

export function DashboardHeader({ user: initialUser }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname || "/";
  const currentLang = i18n.language?.startsWith("vi") ? "vi" : "en";

  const [user, setUser] = useState(initialUser);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const getSettingsKey = (email) => `ai_greeting_enabled_${email || "guest"}`;

  const [aiGreetingEnabled, setAiGreetingEnabled] = useState(() => {
    const saved = localStorage.getItem(getSettingsKey(initialUser?.email));
    return saved === null ? true : saved === "true";
  });
  const [aiGreeting, setAiGreeting] = useState({ title: "", subtitle: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Determine honorific based on user gender
  const userHonorific = user?.gender === "female" ? "Cô" : "Thầy";

  // Extract first name for a friendlier tone
  const firstName = user?.fullName?.split(" ").pop() || "User";

  // Simple local fallback (for offline/API failure or if disabled)
  const getLocalGreeting = () => {
    const hour = new Date().getHours();
    const isVi = i18n.language?.startsWith("vi");
    
    if (!aiGreetingEnabled) {
      return {
        title: isVi ? `Chào ${userHonorific} ${firstName}! 👋` : `Hello, ${userHonorific} ${firstName}! 👋`,
        subtitle: isVi ? `Hôm nay ${userHonorific.toLowerCase()} thấy thế nào rồi ạ?` : `How are you feeling today, ${userHonorific.toLowerCase()}?`
      };
    }

    const timeGreeting = isVi 
      ? (hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Làm việc muộn thế")
      : (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Working late");
    
    return {
      title: isVi ? `${timeGreeting}, ${userHonorific} ${firstName}! 👋` : `${timeGreeting}, ${userHonorific} ${firstName}! 👋`,
      subtitle: isVi ? `Em đã sẵn sàng đồng hành cùng ${userHonorific.toLowerCase()} rồi ạ.` : `I'm ready to support you, ${userHonorific.toLowerCase()}!`
    };
  };

  // REAL API Fetch Logic
  const fetchGreetingFromAPI = async (silent = false) => {
    if (!aiGreetingEnabled) {
      setAiGreeting(getLocalGreeting());
      return;
    }
    
    if (!silent) setIsLoading(true);
    try {
      const response = await axiosInstance.post("/ai/greeting", {
        pathname,
        fullName: user?.fullName || "User",
        language: i18n.language?.startsWith("vi") ? "vi" : "en",
        honorific: userHonorific // Pass it to AI
      });
      if (response.data && response.data.title) {
        setAiGreeting(response.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      setAiGreeting(getLocalGreeting());
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Sync with prop changes and handle outside clicks
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // When user changes (switch account), reset greeting + reload per-user settings
  useEffect(() => {
    const nextEmail = initialUser?.email;
    const saved = localStorage.getItem(getSettingsKey(nextEmail));
    setAiGreetingEnabled(saved === null ? true : saved === "true");
    setAiGreeting({ title: "", subtitle: "" });
  }, [initialUser?.email]);

  useEffect(() => {
    const handleSettingsChange = () => {
      const latestUser = JSON.parse(localStorage.getItem("user") || "{}");
      const enabled = localStorage.getItem(getSettingsKey(latestUser.email)) !== "false";
      setAiGreetingEnabled(enabled);
      setUser(latestUser);
    };

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("settingsChanged", handleSettingsChange);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("settingsChanged", handleSettingsChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initial fetch and re-fetch when enabled state changes
  useEffect(() => {
    fetchGreetingFromAPI(true);
  }, [currentLang, aiGreetingEnabled, pathname, user?.email, user?.fullName, user?.gender]);

  // Update greeting every 1 minute if enabled
  useEffect(() => {
    if (!aiGreetingEnabled) return;
    
    const interval = setInterval(() => {
      fetchGreetingFromAPI(true);
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [currentLang, aiGreetingEnabled, pathname, user?.email, user?.fullName, user?.gender]);

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  try {
    return (
      <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
        {/* Page Title or Breadcrumb could go here */}
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key="greeting-container"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <AnimatePresence mode="wait">
                    <motion.h2
                    key={`ai-title-${aiGreeting.title}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-xl font-bold text-foreground leading-tight"
                  >
                    {aiGreeting.title || getLocalGreeting().title}
                  </motion.h2>
                </AnimatePresence>
                
                <div className="h-5 overflow-hidden mt-0.5">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`ai-sub-${aiGreeting.subtitle}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="text-[11px] text-muted-foreground font-medium italic opacity-80"
                    >
                      {aiGreeting.subtitle || getLocalGreeting().subtitle}
                    </motion.p>
                  </AnimatePresence>
                </div>
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
                currentLang === "vi"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              VI
            </button>
            <button
              onClick={() => toggleLanguage("en")}
              className={`relative z-10 w-9 h-7 flex items-center justify-center text-[10px] font-bold transition-colors duration-200 ${
                currentLang === "en"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
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
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pl-3 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none">
                  {user?.fullName}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tight">
                  {Array.isArray(user?.role)
                    ? user.role[0]?.replace("ROLE_", "")
                    : user?.role?.replace("ROLE_", "")}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-primary/20 to-purple-600/20 border border-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  showProfileMenu && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                        {t("dashboard.header.account")}
                      </p>
                    </div>
                    <Link 
                      to="/dashboard/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors group"
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      {t("dashboard.sidebar.profile")}
                    </Link>
                    <Link 
                      to="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors group"
                    >
                      <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                      {t("dashboard.sidebar.settings")}
                    </Link>
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
  } catch (err) {
    console.error("DashboardHeader crash:", err);
    return (
      <header className="h-20 bg-background border-b border-border flex items-center px-8">
        Header Failure
      </header>
    );
  }
}
