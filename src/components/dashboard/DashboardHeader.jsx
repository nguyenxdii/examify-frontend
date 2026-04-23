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
          {/* Removed AI Greeting section */}
        </div>

        {/* Empty header or Breadcrumbs can go here in the future */}
        <div></div>
        <div></div>
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
