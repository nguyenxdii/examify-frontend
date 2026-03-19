import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BookOpen, Calendar, FileQuestion, Trash2, Edit2, 
  Plus, ChevronLeft, Loader2, AlertCircle, CheckCircle2,
  Clock, Share2, LayoutGrid, Info
} from "lucide-react";
import { getExamDetail, getQuestions, deleteQuestion, deleteExam, updateExam } from "../../../api/examApi";
import QuestionModal from "../../../components/dashboard/QuestionModal";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { toast } from "react-hot-toast";

export default function ExamDetail() {
  const { t } = useTranslation();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "question", // 'question' or 'exam'
    targetId: null,
    title: "",
    message: ""
  });

  const fetchData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        getExamDetail(examId),
        getQuestions(examId)
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data || []);
    } catch (err) {
      toast.error(t("wizard.list.fetchError") || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

  const handleSetReady = async () => {
    try {
      await updateExam(examId, { status: "ready" });
      toast.success(t("common.update_success") || "Đã cập nhật trạng thái");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDeleteQuestion = (qId) => {
    setConfirmModal({
      isOpen: true,
      type: "question",
      targetId: qId,
      title: t("wizard.list.deleteTitle") || "Xác nhận xóa câu hỏi",
      message: t("wizard.detail.deleteQuestionConfirm") || "Bạn có chắc chắn muốn xóa câu hỏi này?"
    });
  };

  const handleDeleteExam = () => {
    setConfirmModal({
      isOpen: true,
      type: "exam",
      targetId: examId,
      title: t("wizard.list.deleteTitle") || "Xác nhận xóa đề thi",
      message: t("wizard.detail.deleteExamConfirm") || "Xác nhận xóa toàn bộ đề thi này?"
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      if (confirmModal.type === "question") {
        await deleteQuestion(examId, confirmModal.targetId);
        toast.success(t("common.delete_success") || "Đã xóa câu hỏi");
        fetchData();
      } else {
        await deleteExam(examId);
        toast.success(t("wizard.list.deleteSuccess") || "Đã xóa đề thi");
        navigate("/dashboard/teacher/my-quizzes");
      }
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "draft":
        return {
          label: t("wizard.detail.status.draft"),
          color: "bg-orange-500",
          icon: <Edit2 className="w-4 h-4" />,
        };
      case "ready":
        return {
          label: t("wizard.detail.status.ready"),
          color: "bg-green-500",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case "shared":
        return {
          label: t("wizard.detail.status.shared"),
          color: "bg-blue-500",
          icon: <Share2 className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          color: "bg-muted",
          icon: <Info className="w-4 h-4" />,
        };
    }
  };

  try {
    if (loading) return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">
          {t("wizard.step6.saving.exam")}
        </p>
      </div>
    );

    if (!exam) return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold">{t("wizard.step2.error")}</h2>
        <button
          onClick={() => navigate("/dashboard/teacher/my-quizzes")}
          className="text-primary font-bold"
        >
          {t("wizard.detail.backToList")}
        </button>
      </div>
    );

    const statusInfo = getStatusInfo(exam.status);

    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard/teacher/my-quizzes")}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground -ml-1.5"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  {t("wizard.detail.backToList")}
                </p>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {exam?.title || "Untitled Exam"}
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground text-base max-w-2xl">
              {exam?.description || t("wizard.detail.noDescription")}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground font-bold">
                <BookOpen className="w-4 h-4 text-primary" />{" "}
                {exam?.subject || t("wizard.detail.unclassified")}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-bold">
                <Calendar className="w-4 h-4 text-primary" />{" "}
                {exam?.createdAt ? new Date(exam.createdAt).toLocaleDateString() : "--/--/----"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-bold">
                <FileQuestion className="w-4 h-4 text-primary" />{" "}
                {t("wizard.detail.questionsCount", { count: questions?.length || 0 })}
              </div>
            </div>
          </div>
          
            <div className="flex gap-2">
              <button
                onClick={handleDeleteExam}
                className="p-3 bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all border border-border"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 bg-muted text-foreground font-bold py-3 px-6 rounded-xl border border-border hover:bg-muted/80 transition-all text-sm">
                <Share2 className="w-4 h-4" /> {t("wizard.detail.share")}
              </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-visible">
          {/* Left: Questions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black font-heading flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />{" "}
                {t("wizard.detail.listHeader")}
              </h2>
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-black px-5 py-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> {t("wizard.detail.addQuestion")}
              </button>
            </div>

            <div className="space-y-4">
              {(!questions || questions.length === 0) ? (
                <div className="bg-card border-2 border-dashed border-border p-12 rounded-3xl text-center">
                  <p className="text-muted-foreground font-bold">
                    {t("wizard.detail.noQuestions")}
                  </p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <motion.div 
                    key={q?.id || idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-2xl p-5 group hover:border-primary transition-all shadow-sm"
                  >
                    <div className="flex gap-6">
                      <div className="w-10 h-10 flex-shrink-0 bg-muted rounded-xl flex items-center justify-center font-black group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg">
                              {q?.type === "multiple_choice" ? t("wizard.step5.types.mc") : 
                               q?.type === "multiple_answer" ? t("wizard.step5.types.ma") : 
                               q?.type === "essay" ? t("wizard.step5.types.essay") : q?.type}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                              q?.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              q?.difficulty === 'hard' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {q?.difficulty === 'easy' ? t("wizard.step3.difficultyLevels.easy") : 
                               q?.difficulty === 'hard' ? t("wizard.step3.difficultyLevels.hard") : 
                               t("wizard.step3.difficultyLevels.medium")}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button 
                              onClick={() => { setSelectedQuestion(q); setIsModalOpen(true); }}
                              className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors"
                              title={t("wizard.step5.edit") || "Sửa"}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors"
                              title={t("common.delete") || "Xóa"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-base font-bold font-heading leading-snug">{q?.content}</h4>
                        {Array.isArray(q?.choices) && q.choices.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {q.choices.map((c, i) => {
                              const isCorrect = Array.isArray(q.correctAnswers) && q.correctAnswers.includes(c.key);
                              return (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "relative p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group/choice",
                                    isCorrect 
                                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10" 
                                      : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                                  )}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all flex-shrink-0",
                                    isCorrect 
                                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-3" 
                                      : "bg-background border border-border text-muted-foreground group-hover/choice:text-primary group-hover/choice:border-primary/50"
                                  )}>
                                    {c.key}
                                  </div>
                                  <span className={cn(
                                    "text-sm leading-relaxed",
                                    isCorrect ? "font-bold text-emerald-900" : "text-foreground/80"
                                  )}>
                                    {c.content}
                                  </span>
                                  {isCorrect && (
                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                      <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {q?.explanation && (
                          <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 items-start">
                            <Info className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t("wizard.questionModal.explanation")}</p>
                              <p className="text-sm text-muted-foreground italic">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-black font-heading tracking-tight">
                {t("wizard.detail.config")}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {t("wizard.detail.time")}
                  </span>
                  <span>
                    -- {t("wizard.detail.minutes")}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5" /> {t("wizard.detail.passScore")}
                  </span>
                  <span>
                    -- {t("wizard.detail.points")}
                  </span>
                </div>
              </div>
              {exam?.status === "draft" ? (
                <button
                  onClick={handleSetReady}
                  className="w-full py-3 bg-orange-500 text-white font-black rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-100 text-sm"
                >
                  {t("wizard.detail.setReady")}
                </button>
              ) : (
                <button className="w-full py-3 bg-primary text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-100 text-sm">
                  {t("wizard.detail.openRoom")}
                </button>
              )}
            </div>

            <div className="bg-muted/30 border border-border border-dashed rounded-2xl p-6 space-y-3">
              <p className="text-[13px] text-muted-foreground font-bold flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> {t("wizard.detail.note")}:
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("wizard.detail.noteDesc")}
              </p>
            </div>
          </div>
        </div>

        <QuestionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          examId={examId} 
          question={selectedQuestion}
          onSuccess={fetchData}
        />

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={handleConfirmDelete}
          title={confirmModal.title}
          message={confirmModal.message}
          type="danger"
          loading={deleteLoading}
        />
      </div>
    );
  } catch (err) {
    console.error("Critical rendering error in ExamDetail:", err);
    return (
      <div className="p-20 text-center space-y-6">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
        <h1 className="text-3xl font-black">Something went wrong</h1>
        <p className="text-muted-foreground">Error: {err.message || "Unknown error"}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold"
        >
          Reload Page
        </button>
        <pre className="mt-8 text-left bg-muted/50 p-6 rounded-3xl text-sm overflow-auto max-w-4xl mx-auto border border-border">
          {err.stack}
        </pre>
      </div>
    );
  }
}
