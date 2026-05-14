import { MoreHorizontal, FileText, Users, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

export function RecentQuizzes({ quizzes, title, onViewAll }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground whitespace-nowrap">{title || t("dashboard.recentQuizzes.title")}</h3>
        <button 
          onClick={onViewAll}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          {t("dashboard.recentQuizzes.viewAll")} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold text-center">{t("dashboard.recentQuizzes.table.title")}</th>
              <th className="px-6 py-4 font-bold text-center">{t("dashboard.recentQuizzes.table.category")}</th>
              <th className="px-6 py-4 font-bold text-center">{t("dashboard.recentQuizzes.table.attempts")}</th>
              <th className="px-6 py-4 font-bold text-center">{t("dashboard.recentQuizzes.table.date")}</th>
              <th className="px-6 py-4 font-bold text-center pr-8">{t("dashboard.recentQuizzes.table.status")}</th>
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
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <span 
                      className="font-bold text-foreground truncate max-w-[200px] whitespace-nowrap block hover:text-primary transition-colors cursor-pointer" 
                      title={quiz.title}
                    >
                      {quiz.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
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
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {quiz.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-center pr-8">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    quiz.status === 'Live' ? 'bg-emerald-500/10 text-emerald-500' : 
                    quiz.status === 'Public' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-orange-500/10 text-orange-500'
                  )}>
                    {quiz.status === 'Live' ? t("exam.detail.status.ready") : 
                     quiz.status === 'Public' ? t("exam.detail.status.shared") : 
                     t("exam.detail.status.draft")}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
