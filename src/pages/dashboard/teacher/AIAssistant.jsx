import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";

export default function AIAssistant() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.aiAssistant")}</h1>
        <p className="text-muted-foreground mt-1">Trò chuyện với AI để nhận gợi ý và hỗ trợ soạn đề.</p>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-6 min-h-[500px] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Chào mừng tới SynDe AI</h2>
          <p className="text-muted-foreground max-w-sm">
            Trợ lý ảo thông minh sẵn sàng giúp bạn soạn câu hỏi, giải thích đáp án và tối ưu hóa đề thi.
          </p>
        </div>
        
        <div className="border-t border-border pt-6 mt-auto">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập câu hỏi cho AI..." 
              className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled
            />
            <button className="absolute right-3 top-2.5 px-4 py-1.5 bg-primary text-white rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">Gửi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
