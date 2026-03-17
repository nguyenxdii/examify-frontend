import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import { Award } from "lucide-react";

export default function Results() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.results")}</h1>
          <p className="text-muted-foreground mt-1">Xem kết quả nộp bài và chấm điểm cho học sinh.</p>
        </div>
        
        <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Chưa có kết quả mới</h2>
          <p className="text-muted-foreground max-w-md">
            Theo dõi tiến trình làm bài và đánh giá kết quả của các học sinh tham gia thi.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
