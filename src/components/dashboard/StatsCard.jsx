import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function StatsCard({ title, value, icon: Icon, trend, description, color }) {
  const isPositive = trend > 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl transition-colors", color || "bg-primary/10 text-primary")}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </div>
    </motion.div>
  );
}
