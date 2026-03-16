import { motion } from "framer-motion";
import { Trophy, Medal, Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

export function TopStudents({ students }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm h-full">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">{t("dashboard.topStudents.title")}</h3>
      </div>
      <div className="p-6 space-y-4">
        {students.map((student, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-lg overflow-hidden capitalize">
                  {student.name.charAt(0)}
                </div>
                {i < 3 && (
                  <div className={cn(
                    "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-card",
                    i === 0 ? "bg-yellow-500 text-white" : 
                    i === 1 ? "bg-slate-300 text-slate-700" : 
                    "bg-orange-400 text-white"
                  )}>
                    {i === 0 ? <Trophy className="w-3 h-3" /> : i === 1 ? <Medal className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-foreground group-hover:text-primary transition-colors">{student.name}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.topStudents.completed", { count: student.quizzes })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-primary">{student.score}%</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t("dashboard.topStudents.avgScore")}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
