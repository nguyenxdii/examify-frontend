import { useTranslation } from "react-i18next";
import { PlusCircle } from "lucide-react";

export default function CreateExam() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.createQuiz")}</h1>
        <p className="text-muted-foreground mt-1">{t("wizard.create.desc")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">{t("wizard.create.manual")}</h3>
          <p className="text-sm text-muted-foreground">{t("wizard.create.manualDesc")}</p>
        </div>
        
        <div 
          onClick={() => navigate("/dashboard/teacher/create-quiz/ai")}
          className="bg-primary/5 border border-primary/20 rounded-3xl p-8 hover:bg-primary/10 transition-colors cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
            {t("wizard.create.recommended")}
          </div>
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">{t("wizard.create.ai")}</h3>
          <p className="text-sm text-muted-foreground">{t("wizard.create.aiDesc")}</p>
        </div>
      </div>
    </div>
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
