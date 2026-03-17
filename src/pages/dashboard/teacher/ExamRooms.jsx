import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";

export default function ExamRooms() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.rooms")}</h1>
        <p className="text-muted-foreground mt-1">Quản lý không gian thi và chia sẻ mã cho học sinh.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Tính năng đang phát triển</h2>
        <p className="text-muted-foreground max-w-md">
          Bạn sẽ có thể tạo các phòng thi ảo, đặt lịch thi và quản lý danh sách học sinh tham gia tại đây.
        </p>
      </div>
    </div>
  );
}
