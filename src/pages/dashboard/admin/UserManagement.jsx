import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";

export default function UserManagement() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.users")}</h1>
        <p className="text-muted-foreground mt-1">Quản lý danh sách giáo viên và trạng thái tài khoản.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Tính năng đang phát triển</h2>
        <p className="text-muted-foreground max-w-md">
          Trang quản lý người dùng sẽ cho phép bạn xem danh sách, khóa hoặc mở tài khoản của giáo viên trong hệ thống.
        </p>
      </div>
    </div>
  );
}
