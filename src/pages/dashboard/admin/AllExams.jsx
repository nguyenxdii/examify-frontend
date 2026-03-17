import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";

export default function AllExams() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.allQuizzes")}</h1>
        <p className="text-muted-foreground mt-1">Xem toàn bộ đề thi hiện có trên hệ thống.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Tính năng đang phát triển</h2>
        <p className="text-muted-foreground max-w-md">
          Trang này sẽ hiển thị toàn bộ đề thi từ tất cả các giáo viên, giúp bạn dễ dàng theo dõi và quản lý nội dung.
        </p>
      </div>
    </div>
  );
}
