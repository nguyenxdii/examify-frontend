import { MoreHorizontal, FileText, Users, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function RecentQuizzes({ quizzes, title }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{title || t("dashboard.recentQuizzes.title")}</h3>
        <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          {t("dashboard.recentQuizzes.viewAll")} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">{t("dashboard.recentQuizzes.table.title")}</th>
              <th className="px-6 py-4 font-bold">{t("dashboard.recentQuizzes.table.category")}</th>
              <th className="px-6 py-4 font-bold text-center">{t("dashboard.recentQuizzes.table.attempts")}</th>
              <th className="px-6 py-4 font-bold">{t("dashboard.recentQuizzes.table.date")}</th>
              <th className="px-6 py-4 font-bold text-right pr-8">{t("dashboard.recentQuizzes.table.status")}</th>
              <th className="px-6 py-4 font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {quizzes.map((quiz, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-foreground">{quiz.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {quiz.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm text-foreground font-medium">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {quiz.attempts}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {quiz.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-right pr-8">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    quiz.status === 'Live' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {quiz.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
