import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { RecentQuizzes } from "../../components/dashboard/RecentQuizzes";
import { TopStudents } from "../../components/dashboard/TopStudents";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Users, Award, Zap, Database, Loader2, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDashboardStats } from "../../api/examApi";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import axiosInstance from "../../api/axiosInstance";

export default function UserDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    document.title = t("titles.user_dashboard") || "Dashboard";
    fetchStats();
  }, [t]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStatsData(res.data);
    } catch (err) {
      toast.error(t("common.error_fetch_stats") || "Không thể tải số liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      const unread = res.data.filter(n => !n.read);
      if (unread.length > 0) {
        setNotifications(unread);
        setCurrentNotification(unread[0]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (!loading && statsData) {
      fetchNotifications();
    }
  }, [loading, statsData]);

  const handleCloseNotification = async () => {
    if (!currentNotification) return;
    try {
      await axiosInstance.patch(`/notifications/${currentNotification.id}/read`);
      const remaining = notifications.slice(1);
      setNotifications(remaining);
      setCurrentNotification(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setCurrentNotification(null);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest text-xs">{t("common.loading")}</p>
    </div>
  );

  const stats = [
    { 
      title: t("dashboard.stats.totalQuizzes") || "Tổng số đề thi", 
      value: statsData?.totalExams || 0, 
      icon: BookOpen, 
      color: "bg-blue-500/10 text-blue-500" 
    },
    { 
      title: t("dashboard.stats.totalStudents") || "Tổng số học sinh", 
      value: statsData?.totalStudents || 0, 
      icon: Users, 
      color: "bg-emerald-500/10 text-emerald-500" 
    },
    { 
      title: t("dashboard.stats.bankQuestions") || "Câu hỏi ngân hàng", 
      value: statsData?.totalQuestionsInBank || 0, 
      icon: Database, 
      color: "bg-purple-500/10 text-purple-500"
    },
  ];

  const recentQuizzes = (statsData?.recentExams || []).map(q => ({
    title: q.title,
    category: q.subject || "Chưa phân loại",
    attempts: q.questionCount || 0, // In RecentQuizzes, 'attempts' is shown with Users icon, maybe change label?
    date: new Date(q.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US'),
    status: q.status === 'ready' ? 'Live' : q.status === 'shared' ? 'Public' : 'Draft'
  }));

  const recentSubmissions = (statsData?.recentSubmissions || []).map(s => ({
    name: s.studentName || s.studentId || "Anonymous",
    quizzes: s.examTitle, // Reuse quizzes field for exam title
    score: Math.round(s.score * 10) / 10, 
    fullScore: Math.round(s.score * 10) / 10
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Text */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">{t("dashboard.user.title") || "Chào mừng quay trở lại!"}</h1>
        <p className="text-muted-foreground mt-1 font-medium">{t("dashboard.user.desc") || "Dưới đây là tổng quan về hoạt động giảng dạy của bạn."}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      {/* Main Content Grid - Stacked Vertically as requested */}
      <div className="flex flex-col gap-8">
        {/* Recent Quizzes - Full Width */}
        <div className="w-full">
          <RecentQuizzes 
            quizzes={recentQuizzes} 
            title={t("dashboard.recentQuizzes.title") || "Đề thi mới nhất"} 
            onViewAll={() => navigate("/dashboard/teacher/my-quizzes")}
          />
        </div>

        {/* Recent Submissions - Full Width */}
        <div className="w-full">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground whitespace-nowrap">{t("dashboard.recentTakers.title") || "Người thi gần đây"}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSubmissions.length > 0 ? recentSubmissions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black uppercase text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">{s.quizzes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-base font-black",
                        s.fullScore >= 8 ? "text-emerald-500" : s.fullScore >= 5 ? "text-amber-500" : "text-rose-500"
                      )}>{Number(s.fullScore || 0).toFixed(1)}/10</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-sm text-muted-foreground font-bold">{t("common.no_data") || "Chưa có dữ liệu"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Notification Popup */}
      <AnimatePresence>
        {currentNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center shadow-inner group">
                   <Zap className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">{currentNotification.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium px-4">
                    Thông báo quan trọng từ hệ thống về hoạt động tài khoản của bạn.
                  </p>
                </div>

                <div className="w-full mt-4 p-6 bg-rose-50/50 dark:bg-rose-950/10 rounded-3xl border border-rose-200/50 dark:border-rose-500/20 text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center">
                       <Activity className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-[0.2em]">{t("notification.reason") || "Lý do hệ thống"}</p>
                  </div>
                  <p className="text-sm text-foreground font-bold leading-relaxed italic pr-4">
                    "{currentNotification.message}"
                  </p>
                </div>
              </div>
              <div className="p-8 pt-0">
                <button
                  onClick={handleCloseNotification}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
                >
                  {t("common.confirm") || "Xác nhận"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
