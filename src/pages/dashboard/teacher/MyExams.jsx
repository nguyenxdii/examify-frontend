import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";

export default function MyExams() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.myQuizzes")}</h1>
        <p className="text-muted-foreground mt-1">Danh sách các đề thi bạn đã tạo.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Chưa có đề thi nào</h2>
        <p className="text-muted-foreground max-w-md">
          Hãy bắt đầu bằng cách tạo đề thi đầu tiên của bạn để học sinh có thể tham gia.
        </p>
      </div>
    </div>
  );
}
