import { useTranslation } from "react-i18next";
import { Database } from "lucide-react";

export default function QuestionBank() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.questions")}</h1>
        <p className="text-muted-foreground mt-1">Kho lưu trữ câu hỏi cá nhân của bạn.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Ngân hàng câu hỏi trống</h2>
        <p className="text-muted-foreground max-w-md">
          Lưu trữ và tái sử dụng các câu hỏi chất lượng của bạn cho nhiều đề thi khác nhau.
        </p>
      </div>
    </div>
  );
}
