import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Plus, Sparkles, Trash2, Calendar, FileQuestion, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyExams, deleteExam } from "../../../api/examApi";
import CreateExamModal from "../../../components/dashboard/CreateExamModal";
import { motion } from "framer-motion";

export default function MyExams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await getMyExams();
      setExams(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đề thi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t("wizard.list.deleteConfirm"))) return;
    
    try {
      await deleteExam(id);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || t("wizard.list.deleteError"));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
            {t("wizard.detail.status.draft")}
          </span>
        );
      case "ready":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
            {t("wizard.detail.status.ready")}
          </span>
        );
      case "shared":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            {t("wizard.detail.status.shared")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground font-heading tracking-tight">
            {t("dashboard.sidebar.myQuizzes")}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {t("wizard.list.desc")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-6 rounded-2xl transition-all border border-border"
          >
            <Plus className="w-5 h-5" />
            {t("wizard.create.manual")}
          </button>
          <button
            onClick={() => navigate("/dashboard/teacher/create-quiz/ai")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-primary/25 hover:-translate-y-1 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5" />
            {t("wizard.create.ai")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">
            {t("wizard.detail.status.loading") || t("wizard.step6.saving.exam")}
          </p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
          <h2 className="text-2xl font-black mb-3 font-heading">
            {t("wizard.list.empty")}
          </h2>
          <p className="text-muted-foreground max-w-md text-lg mb-8">
            {t("wizard.list.emptyDesc")}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-muted rounded-2xl font-bold hover:bg-muted/80 transition-all"
            >
              {t("wizard.create.manual")}
            </button>
            <button
              onClick={() => navigate("/dashboard/teacher/create-quiz/ai")}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {t("wizard.list.tryAi")}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/dashboard/teacher/my-quizzes/${exam.id}`)}
              className="group relative bg-card hover:bg-muted/30 border border-border rounded-[2.5rem] p-6 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                  <FileQuestion className="w-6 h-6" />
                </div>
                {getStatusBadge(exam.status)}
              </div>
              
              <h3 className="text-xl font-bold font-heading mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {exam.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-6 min-h-[2.5rem]">
                {exam.description || t("wizard.list.noDescription")}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <BookOpen className="w-4 h-4" />{" "}
                  {exam.subject || t("wizard.list.unclassified")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Calendar className="w-4 h-4" />{" "}
                  {new Date(exam.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary font-bold bg-primary/5 py-1.5 px-3 rounded-xl w-fit">
                  <span className="text-lg">{exam.questionCount || 0}</span>{" "}
                  {t("wizard.detail.questionsCount", {
                    count: exam.questionCount || 0,
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={(e) => handleDelete(e, exam.id)}
                  disabled={exam.status !== "draft"}
                  className={`p-2.5 rounded-xl transition-all ${
                    exam.status === "draft"
                      ? "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                      : "opacity-20 cursor-not-allowed text-muted-foreground"
                  }`}
                  title={
                    exam.status !== "draft"
                      ? t("wizard.list.deleteWarning")
                      : t("wizard.list.deleteConfirm")
                  }
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 text-primary font-bold text-sm">
                  {t("wizard.list.details")}{" "}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
