import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, BookOpen, Activity, Send, 
  ArrowUpRight, ArrowDownRight, 
  Search, ExternalLink, Calendar,
  TrendingUp, TrendingDown, Clock, BarChart3,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { getStats, getExams } from "../../../api/adminApi";
import { cn } from "../../../lib/utils";

export default function SystemStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("titles.admin_stats");
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
      setExams(examsRes.data.slice(0, 5)); // Just recent 5
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t("dashboard.admin.stats.total_users"),
      value: stats?.users?.total || 0,
      change: stats?.users?.percentageChange || 0,
      trend: stats?.users?.trend || "neutral",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: t("dashboard.admin.stats.total_exams"),
      value: stats?.exams?.total || 0,
      change: stats?.exams?.percentageChange || 0,
      trend: stats?.exams?.trend || "neutral",
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: t("dashboard.admin.stats.new_submissions"),
      value: stats?.submissions?.total || 0,
      change: stats?.submissions?.percentageChange || 0,
      trend: stats?.submissions?.trend || "up",
      icon: Send,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: t("dashboard.admin.stats.active_rooms"),
      value: stats?.rooms?.total || 0,
      change: stats?.rooms?.percentageChange || 0,
      trend: stats?.rooms?.trend || "up",
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            {t("dashboard.sidebar.analytics")}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">{t("dashboard.admin.stats.system_exams")}</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/10 transition-all text-xs"
        >
          <Clock className={cn("w-4 h-4", loading && "animate-spin")} />
          {t("common.refresh")}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
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
              <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">{card.title}</p>
              <h3 className="text-2xl font-black text-foreground">{card.value.toLocaleString()}</h3>
              <p className="text-[10px] text-muted-foreground font-medium">{t("dashboard.admin.stats.vs_last_month")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Exams List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t("dashboard.admin.stats.system_exams")}
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">{t("common.view_all")}</button>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-border/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded-full w-1/3" />
                      <div className="h-3 bg-muted rounded-full w-1/4" />
                    </div>
                  </div>
                ))
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <div key={exam.id} className="p-5 hover:bg-muted/10 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all">
                        {exam.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{exam.title}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Users className="w-3 h-3" /> {exam.teacherName}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <BookOpen className="w-3 h-3" /> {exam.questionCount} {t("common.questions")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {new Date(exam.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                       </span>
                       <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter",
                        exam.status === "shared" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                       )}>
                        {exam.status === 'shared' ? t("common.published") : t("common.private")}
                       </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-muted-foreground font-bold">
                  {t("dashboard.admin.exams.no_exams")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity / Session Info */}
        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3 px-2">
            <Activity className="w-5 h-5 text-primary" />
            {t("dashboard.admin.stats.online_status")}
          </h3>
          
          <div className="bg-gradient-to-br from-primary to-purple-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <p className="text-white/60 text-xs font-black uppercase tracking-widest">{t("dashboard.admin.stats.currently_online")}</p>
                  <h4 className="text-5xl font-black">12</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-3">
                    <span className="opacity-80">{t("dashboard.admin.stats.running_rooms")}</span>
                    <span>8</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-3">
                    <span className="opacity-80">{t("dashboard.admin.stats.submissions_24h")}</span>
                    <span>124</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="opacity-80">{t("dashboard.admin.stats.response_time")}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 24ms</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-bold text-sm transition-all border border-white/10">
                  {t("dashboard.admin.stats.view_session_details")}
                </button>
             </div>

             {/* Decorative circles */}
             <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
             <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-purple-400/20 rounded-full blur-2xl" />
          </div>

          {/* Quick Info */}
          <div className="bg-card border border-border rounded-[2.5rem] p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs font-bold">{t("dashboard.admin.stats.system_stable")}</p>
                <p className="text-[10px] text-muted-foreground">{t("dashboard.admin.stats.all_services_good")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs font-bold">{t("dashboard.admin.stats.update_available")}</p>
                <p className="text-[10px] text-muted-foreground">{t("dashboard.admin.stats.ready_to_deploy")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
