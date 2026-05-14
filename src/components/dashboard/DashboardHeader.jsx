import {
  Bell,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Globe,
  Layout,
  X,
  FileText,
  AlertCircle
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
  const [user, setUser] = useState(initialUser);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/api/notifications");
      setNotifications(res.data || []);
      setUnreadCount(res.data?.filter(n => !n.read && !n.isRead).length || 0);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex flex-col">
      </div>

      <div className="flex items-center gap-6">
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest">{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-muted transition-all relative group"
          >
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest">{t("common.notifications") || "Thông báo"}</h3>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{unreadCount} mới</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{t("common.no_notifications") || "Không có thông báo nào"}</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "p-4 border-b border-border/50 hover:bg-muted/50 transition-all cursor-pointer group relative",
                          (!n.read && !n.isRead) && "bg-primary/5"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            n.type === 'DANGER' || n.type === 'EXAM_DELETED' ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                          )}>
                            {n.type === 'DANGER' || n.type === 'EXAM_DELETED' ? <X className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{n.title}</h4>
                            <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{n.message}</p>
                            <p className="text-[10px] font-medium text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        {(!n.read && !n.isRead) && <div className="absolute top-1/2 right-4 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-black text-foreground truncate max-w-[120px]">{user?.fullName || "User"}</span>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{user?.role}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showProfileMenu && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
              >
                <div className="px-4 py-3 mb-2 border-b border-border">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t("common.account") || "Tài khoản"}</p>
                  <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-sm font-bold text-muted-foreground mb-1"
                >
                  <Settings className="w-4 h-4" />
                  {t("dashboard.sidebar.profile")}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all text-sm font-bold text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  {t("dashboard.sidebar.logout")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
