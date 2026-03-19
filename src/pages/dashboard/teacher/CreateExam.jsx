import { useTranslation } from "react-i18next";
import { PlusCircle, Sparkles, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.createQuiz")}</h1>
        <p className="text-muted-foreground mt-1">{t("wizard.create.desc")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate("/dashboard/teacher/create-quiz/manual")}
          className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">{t("wizard.create.manual")}</h3>
            <p className="text-sm text-muted-foreground">{t("wizard.create.manualDesc")}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary/80">
              <Wand2 className="w-4 h-4" />
              {t("common.preview")}
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate("/dashboard/teacher/create-quiz/ai")}
          className="bg-primary/5 border border-primary/20 rounded-3xl p-8 hover:bg-primary/10 transition-colors cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
            {t("wizard.create.recommended")}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">{t("wizard.create.ai")}</h3>
          <p className="text-sm text-muted-foreground">{t("wizard.create.aiDesc")}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-xs text-muted-foreground">
        &copy; 2025 SynDe System. All rights reserved.
      </footer>
    </div>
  );
}
