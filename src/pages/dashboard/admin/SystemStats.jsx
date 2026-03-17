import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";

export default function SystemStats() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.analytics")}</h1>
        <p className="text-muted-foreground mt-1">Thống kê chi tiết về người dùng và đề thi theo thời gian.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Tính năng đang phát triển</h2>
        <p className="text-muted-foreground max-w-md">
          Biểu đồ và số liệu thống kê về sự tăng trưởng của hệ thống sẽ được cập nhật tại đây.
        </p>
      </div>
    </div>
  );
}
