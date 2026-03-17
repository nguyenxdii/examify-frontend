import { StatsCard } from "../../components/dashboard/StatsCard";
import { RecentQuizzes } from "../../components/dashboard/RecentQuizzes";
import { TopStudents } from "../../components/dashboard/TopStudents";
import { BookOpen, Users, Award, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserDashboard() {
  const { t } = useTranslation();

  const stats = [
    { title: t("dashboard.stats.totalQuizzes"), value: "24", icon: BookOpen, trend: 12, description: t("dashboard.stats.newThisWeek", { count: 4 }), color: "bg-blue-500/10 text-blue-500" },
    { title: t("dashboard.stats.totalStudents"), value: "1,284", icon: Users, trend: 8, description: t("dashboard.stats.fromLastMonth", { count: 120 }), color: "bg-emerald-500/10 text-emerald-500" },
    { title: t("dashboard.stats.avgScore"), value: "78%", icon: Award, trend: -3, description: "Keep it up!", color: "bg-purple-500/10 text-purple-500" },
    { title: t("dashboard.stats.completionRate"), value: "92%", icon: Zap, trend: 5, description: "Highly active", color: "bg-orange-500/10 text-orange-500" },
  ];

  const recentQuizzes = [
    { title: "Final Exam - Physics", category: "Science", attempts: 124, date: "2 hours ago", status: "Live" },
    { title: "Midterm Math Quiz", category: "Math", attempts: 89, date: "Yesterday", status: "Closed" },
    { title: "Organic Chemistry Basics", category: "Chemistry", attempts: 56, date: "3 days ago", status: "Live" },
    { title: "World Geography", category: "General", attempts: 210, date: "1 week ago", status: "Live" },
  ];

  const topStudents = [
    { name: "John Doe", quizzes: 12, score: 98 },
    { name: "Sarah Smith", quizzes: 15, score: 95 },
    { name: "Mike Johnson", quizzes: 10, score: 92 },
    { name: "Emily Brown", quizzes: 8, score: 89 },
    { name: "Alex Wilson", quizzes: 11, score: 87 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Text */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.user.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.user.desc")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quizzes - Left 2/3 */}
        <div className="lg:col-span-2">
          <RecentQuizzes quizzes={recentQuizzes} title={t("dashboard.recentQuizzes.title")} />
        </div>

        {/* Top Students - Right 1/3 */}
        <div className="lg:col-span-1">
          <TopStudents students={topStudents} />
        </div>
      </div>
    </div>
  );
}
