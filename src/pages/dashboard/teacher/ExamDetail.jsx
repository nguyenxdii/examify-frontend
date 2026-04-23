import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BookOpen, Calendar, FileQuestion, Trash2, Edit2, 
  Plus, ChevronLeft, Loader2, AlertCircle, CheckCircle2,
  Clock, Share2, LayoutGrid, Info, Database, RotateCw
} from "lucide-react";
import { getExamDetail, getQuestions, deleteQuestion, deleteExam, updateExam } from "../../../api/examApi";
import QuestionModal from "../../../components/dashboard/QuestionModal";
import QuestionBankModal from "../../../components/dashboard/QuestionBankModal";
import CreateRoomModal from "../../../components/dashboard/CreateRoomModal";
import ShareExamModal from "../../../components/dashboard/ShareExamModal";
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
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "question", // 'question' or 'exam'
    targetId: null,
    title: "",
    message: ""
  });
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    duration: 0,
    passScore: 0,
    isShuffled: false
  });

  const fetchData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        getExamDetail(examId),
        getQuestions(examId)
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data || []);
      setConfigForm({
        duration: examRes.data.duration || 0,
        passScore: examRes.data.passScore || 0,
        isShuffled: examRes.data.isShuffled ?? examRes.data.shuffled ?? false
      });
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
    if (!exam.duration || exam.duration <= 0) {
      toast.error("Vui lòng thiết lập thời gian làm bài lớn hơn 0");
      setIsEditingConfig(true);
      return;
    }
    try {
      await updateExam(examId, {
        title: exam.title,
        subject: exam.subject,
        description: exam.description,
        duration: exam.duration,
        passScore: exam.passScore,
        status: "ready"
      });
      toast.success(t("common.update_success") || "Đã cập nhật trạng thái");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };
  
  const handleShare = async () => {
    try {
      if (exam.status !== "shared") {
        await updateExam(examId, {
          title: exam.title,
          subject: exam.subject,
          description: exam.description,
          duration: exam.duration,
          passScore: exam.passScore,
          status: "shared"
        });
        fetchData();
      }
      setIsShareModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi chia sẻ đề thi");
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await updateExam(examId, {
        ...configForm,
        shuffled: configForm.isShuffled, // ensure backend receives it
        title: exam.title,
        subject: exam.subject,
        description: exam.description,
        status: exam.status
      });
      toast.success(t("common.update_success") || "Cập nhật cấu hình thành công");
      setIsEditingConfig(false);
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi cập nhật cấu hình");
    }
  };

  const handleDeleteQuestion = (qId) => {
    setConfirmModal({
      isOpen: true,
      type: "question",
      targetId: qId,
      title: "Xác nhận xóa câu hỏi",
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
      } else if (confirmModal.type === "ready") {
        await handleSetReady();
      } else {
        await deleteExam(examId);
        toast.success(t("wizard.list.deleteSuccess") || "Đã xóa đề thi");
        navigate("/dashboard/teacher/my-quizzes");
      }
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác");
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
      <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* New Refined Header Section */}
        <div className="space-y-6">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard/teacher/my-quizzes")}
              className="group flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted border border-border rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                {t("wizard.detail.backToList") || "Quay lại"}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteExam}
                className="p-2.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all border border-transparent"
                title="Xóa đề thi"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Info Hero - Softer Version */}
          <div className="relative p-8 bg-card border border-border rounded-[1.5rem] shadow-sm">
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white",
                  statusInfo.color
                )}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wider">
                  <BookOpen className="w-3 h-3 text-primary" />
                  {exam?.subject || "Chưa phân loại"}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-snug">
                  {exam?.title || "Untitled Exam"}
                </h1>
                {exam?.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                    {exam.description}
                  </p>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="flex flex-wrap gap-10 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Ngày tạo</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary/60" />
                    {exam?.createdAt ? new Date(exam.createdAt).toLocaleDateString("vi-VN") : "--/--/----"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Cấu trúc</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileQuestion className="w-3.5 h-3.5 text-primary/60" />
                    {questions?.length || 0} câu hỏi
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Thời lượng</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary/60" />
                    {exam?.duration || "--"} phút
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-visible">
          {/* Left: Questions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />{" "}
                {t("wizard.detail.listHeader")}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsBankModalOpen(true)}
                  disabled={exam.status !== "draft"}
                  className="flex items-center gap-2 bg-muted text-foreground font-bold px-5 py-2 rounded-xl border border-border hover:bg-muted/80 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Database className="w-4 h-4 text-primary" /> {t("bank.modal_title") || "Chọn từ ngân hàng"}
                </button>
                <button
                  onClick={() => {
                    setSelectedQuestion(null);
                    setIsModalOpen(true);
                  }}
                  disabled={exam.status !== "draft"}
                  className="flex items-center gap-2 bg-[#8B5CF6] text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> {t("wizard.detail.addQuestion")}
                </button>
              </div>
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
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg">
                              {q?.type === "multiple_choice" ? t("wizard.step5.types.mc") : 
                               q?.type === "multiple_answer" ? t("wizard.step5.types.ma") : 
                               q?.type === "essay" ? t("wizard.step5.types.essay") : q?.type}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
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
                            {exam.status === "draft" && (
                              <>
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
                              </>
                            )}
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
                               <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{t("wizard.questionModal.explanation")}</p>
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
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-bold tracking-tight">
                  {t("wizard.detail.config")}
                </h3>
                {!isEditingConfig && (
                  <button 
                    onClick={() => setIsEditingConfig(true)}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Chỉnh sửa
                  </button>
                )}
              </div>
              
              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {t("wizard.detail.time")}
                  </span>
                  {isEditingConfig ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={configForm.duration}
                        onChange={(e) => setConfigForm({...configForm, duration: parseInt(e.target.value) || 0})}
                        className="w-20 px-2 py-1 bg-muted border border-border rounded-md text-right focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="text-[11px] text-muted-foreground">phút</span>
                    </div>
                  ) : (
                    <span className="font-bold">
                      {exam?.duration || "--"} {t("wizard.detail.minutes")}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t("wizard.detail.passScore")}
                  </span>
                  {isEditingConfig ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.5"
                        value={configForm.passScore}
                        onChange={(e) => setConfigForm({...configForm, passScore: parseFloat(e.target.value) || 0})}
                        className="w-20 px-2 py-1 bg-muted border border-border rounded-md text-right focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="text-[11px] text-muted-foreground">/ 10 {t("wizard.detail.points")}</span>
                    </div>
                  ) : (
                    <span className="font-bold">
                      {exam?.passScore || "--"} / 10 {t("wizard.detail.points")}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5" /> {t("wizard.detail.isShuffled")}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-normal leading-tight max-w-[140px]">
                      {t("wizard.detail.isShuffledDesc")}
                    </p>
                  </div>
                  {isEditingConfig ? (
                    <button
                      onClick={() => setConfigForm({...configForm, isShuffled: !configForm.isShuffled})}
                      className={cn(
                        "w-10 h-6 rounded-full transition-all relative",
                        configForm.isShuffled ? "bg-primary" : "bg-muted border border-border"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full transition-all",
                        configForm.isShuffled ? "right-1 bg-white" : "left-1 bg-muted-foreground/30"
                      )} />
                    </button>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                      (exam?.isShuffled || exam?.shuffled) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {(exam?.isShuffled || exam?.shuffled) ? "Đã bật" : "Đã tắt"}
                    </span>
                  )}
                </div>

                {isEditingConfig && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingConfig(false)}
                      className="flex-1 py-2 bg-muted text-muted-foreground font-bold rounded-xl text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleUpdateConfig}
                      className="flex-1 py-2 bg-primary text-white font-bold rounded-xl text-xs"
                    >
                      Lưu cấu hình
                    </button>
                  </div>
                )}
              </div>
              {exam?.status === "draft" ? (
                <button
                  onClick={() => setConfirmModal({
                    isOpen: true,
                    type: "ready",
                    targetId: examId,
                    title: t("wizard.detail.setReady") || "Xác nhận Sẵn sàng",
                    message: "Khi chuyển sang trạng thái Sẵn sàng, bạn sẽ không thể chỉnh sửa nội dung câu hỏi nữa. Bạn có chắc chắn?"
                  })}
                  className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/25 hover:scale-[1.02] transition-all active:scale-100 text-sm"
                >
                  {t("wizard.detail.setReady")}
                </button>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsCreateRoomModalOpen(true)}
                    className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-100 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {t("wizard.detail.openRoom")}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full py-3.5 bg-muted border-2 border-transparent text-foreground font-bold rounded-2xl hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Share2 className="w-4 h-4 text-primary" /> {t("wizard.detail.share") || "Chia sẻ cho mọi người"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-muted/30 border border-border border-dashed rounded-2xl p-6 space-y-3">
               <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> {t("wizard.detail.note")}:
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("wizard.detail.noteDesc")}
              </p>
            </div>
          </div>
        </div>

        <QuestionBankModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          examId={examId}
          existingQuestions={questions}
          onSuccess={fetchData}
        />

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
          type={confirmModal.type === "ready" ? "success" : "danger"}
          loading={deleteLoading}
        />

        <CreateRoomModal
          isOpen={isCreateRoomModalOpen}
          onClose={() => setIsCreateRoomModalOpen(false)}
          initialExamId={examId}
          onSuccess={(newRoomId) => {
            setIsCreateRoomModalOpen(false);
            navigate(`/dashboard/teacher/rooms/${newRoomId}`);
          }}
        />

        <ShareExamModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          examId={examId}
          examTitle={exam.title}
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
