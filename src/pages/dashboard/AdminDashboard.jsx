import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { RecentQuizzes } from "../../components/dashboard/RecentQuizzes";
import { ShieldCheck, Users, Database, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const stats = [
    { title: t("dashboard.stats.totalUsers"), value: "8,542", icon: Users, trend: 15, description: t("dashboard.stats.newToday", { count: 24 }), color: "bg-blue-500/10 text-blue-500" },
    { title: t("dashboard.stats.totalQuizzes"), value: "12,109", icon: Database, trend: 10, description: t("dashboard.stats.fromLastMonth", { count: 450 }), color: "bg-purple-500/10 text-purple-500" },
    { title: t("dashboard.stats.activeSessions"), value: "432", icon: Activity, trend: 22, description: t("dashboard.stats.realTime"), color: "bg-emerald-500/10 text-emerald-500" },
    { title: t("dashboard.stats.systemHealth"), value: "99.9%", icon: ShieldCheck, trend: 0, description: t("dashboard.stats.allSystemsGo"), color: "bg-orange-500/10 text-orange-500" },
  ];

  const recentGlobalQuizzes = [
    { title: "Entrance Exam 2025", category: "Education", attempts: 5420, date: "10 mins ago", status: "Live" },
    { title: "Python Advanced", category: "Tech", attempts: 1204, date: "1 hour ago", status: "Live" },
    { title: "History of Rome", category: "History", attempts: 890, date: "4 hours ago", status: "Closed" },
    { title: "Biology Quiz", category: "Science", attempts: 2100, date: "Yesterday", status: "Live" },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.admin.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.admin.desc")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* System Activity */}
        <div className="grid grid-cols-1 gap-8">
          <RecentQuizzes quizzes={recentGlobalQuizzes} title={t("dashboard.recentQuizzes.globalTitle")} />
        </div>

        {/* Admin Specific Sections */}
        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20">
          <h3 className="text-xl font-bold text-primary mb-2">{t("dashboard.admin.maintenance")}</h3>
          <p className="text-muted-foreground text-sm">{t("dashboard.admin.maintenanceDesc")}</p>
          <button className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
            {t("dashboard.admin.viewLogs")}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
