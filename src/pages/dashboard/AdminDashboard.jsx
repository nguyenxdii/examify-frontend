import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, BookOpen, Send, Activity, 
  ArrowUpRight, ArrowDownRight, 
  TrendingUp, Clock, BarChart3,
  CheckCircle2, AlertCircle, Calendar
} from "lucide-react";
import { getStats, getExams } from "../../api/adminApi";
import { cn } from "../../lib/utils";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("titles.admin_dashboard");
  }, [t]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, examsRes] = await Promise.all([
        getStats(),
        getExams()
      ]);
      setStats(statsRes.data);
      setExams(examsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t("dashboard.admin.stats.total_users") || "Tổng người dùng",
      value: stats?.users?.total || 0,
      change: stats?.users?.percentageChange || 0,
      trend: stats?.users?.trend || "neutral",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: t("dashboard.admin.stats.total_exams") || "Tổng đề thi",
      value: stats?.exams?.total || 0,
      change: stats?.exams?.percentageChange || 0,
      trend: stats?.exams?.trend || "neutral",
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: t("dashboard.admin.stats.new_submissions") || "Bài nộp mới",
      value: stats?.submissions?.total || 0,
      change: stats?.submissions?.percentageChange || 0,
      trend: stats?.submissions?.trend || "up",
      icon: Send,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: t("dashboard.admin.stats.active_rooms") || "Phòng đang mở",
      value: stats?.rooms?.total || 0,
      change: stats?.rooms?.percentageChange || 0,
      trend: stats?.rooms?.trend || "up",
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">{t("dashboard.admin.title") || "Bảng quản trị"}</h1>
        <p className="text-muted-foreground mt-1 font-medium">{t("dashboard.admin.desc") || "Tổng quan hoạt động toàn hệ thống Examify."}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", card.bgColor)}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                card.trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
              )}>
                {card.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(card.change)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{card.title}</p>
              <h3 className="text-2xl font-black text-foreground">{card.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Recent Exams */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black flex items-center gap-3">
                    {t("dashboard.admin.recent_exams") || "Đề thi mới nhất"}
                </h3>
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/50">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-6 animate-pulse flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded-full w-1/4" />
                                    <div className="h-3 bg-muted rounded-full w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : exams.length > 0 ? (
                        exams.map((exam) => (
                            <div key={exam.id} className="p-6 hover:bg-muted/10 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                        {exam.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-bold text-foreground text-sm truncate block" title={exam.title}>{exam.title}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium truncate">{exam.teacherName} • {exam.questionCount} {t("common.questions") || "Câu hỏi"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center text-muted-foreground font-bold">{t("dashboard.admin.exams.no_exams") || "Chưa có đề thi nào"}</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
