import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import { PlusCircle } from "lucide-react";

export default function CreateExam() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.createQuiz")}</h1>
          <p className="text-muted-foreground mt-1">Tạo đề thi mới bằng tay hoặc sử dụng trí tuệ nhân tạo (AI).</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Tạo thủ công</h3>
            <p className="text-sm text-muted-foreground">Tự tay biên soạn từng câu hỏi và đáp án cho đề thi của bạn.</p>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 hover:bg-primary/10 transition-colors cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">Khuyên dùng</div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Tạo bằng AI</h3>
            <p className="text-sm text-muted-foreground">Tải lên tài liệu hoặc nhập chủ đề để AI tự động soạn đề thi cho bạn.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Zap(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71 12 2.5l2 11h6L12 26l-2-11.29z" />
    </svg>
  );
}
