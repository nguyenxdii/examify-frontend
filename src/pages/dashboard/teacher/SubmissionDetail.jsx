import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Loader2, CheckCircle2, XCircle, 
  AlertCircle, MessageSquare, Award, Clock, User, 
  BookOpen, Sparkles, Check, X, ShieldCheck
} from "lucide-react";
import { 
  getSubmissionDetail, gradeEssay, getRoomDetail, 
  publishScores, publishIndividualScore, toggleSubmissionGraded 
} from "../../../api/roomApi";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck as ShieldIcon, ChevronDown } from "lucide-react";

export default function SubmissionDetail() {
  const { t } = useTranslation();
  const { roomId, submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [room, setRoom] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isIndividualPublishing, setIsIndividualPublishing] = useState(false);
  const [isTogglingGraded, setIsTogglingGraded] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [roomId, submissionId]);

  useEffect(() => {
    if (submission) {
      document.title = t("titles.submission_detail", { name: submission.studentName, id: submission.studentId });
    }
  }, [submission, t]);

  const fetchDetail = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [subRes, roomRes] = await Promise.all([
        getSubmissionDetail(roomId, submissionId),
        getRoomDetail(roomId)
      ]);
      setSubmission(subRes.data);
      setRoom(roomRes.data);
    } catch (error) {
      toast.error(t("rooms.fetch_error"));
      navigate(`/dashboard/teacher/rooms/${roomId}`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setIsPublishing(true);
      const newStatus = !room.scoresPublished;
      await publishScores(roomId, newStatus);
      toast.success(newStatus ? t("common.publish_success") : t("common.unpublish_success"));
      fetchDetail(true);
    } catch (error) {
      toast.error(t("common.error_update_publish"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleIndividualPublish = async () => {
    try {
      setIsIndividualPublishing(true);
      const newStatus = !submission.published;
      await publishIndividualScore(roomId, submissionId, newStatus);
      toast.success(newStatus ? t("common.publish_individual_success") : t("common.unpublish_individual_success"));
      fetchDetail(true);
    } catch (error) {
      toast.error(t("common.error_update_publish"));
    } finally {
      setIsIndividualPublishing(false);
    }
  };

  const handleToggleGradedStatus = async () => {
    try {
      setIsTogglingGraded(true);
      const newGraded = !submission.isGraded;
      await toggleSubmissionGraded(roomId, submissionId, newGraded);
      toast.success(newGraded ? t("common.confirm_graded_success") : t("common.unconfirm_graded_success"));
      fetchDetail(true);
    } catch (error) {
      toast.error(t("common.error_update_graded"));
    } finally {
      setIsTogglingGraded(false);
    }
  };

  const handleGrade = async (answerId, isCorrect) => {
    try {
      setIsGrading(true);
      const score = isCorrect ? 10 : 0;
      await gradeEssay(roomId, submissionId, {
        submissionAnswerId: answerId,
        finalScore: score,
        confirm: true 
      });
      toast.success(t("rooms.grade_success"));
      fetchDetail(true); // Silent update
    } catch (error) {
      toast.error(t("rooms.grade_error"));
    } finally {
      setIsGrading(false);
    }
  };

  useEffect(() => {
    if (submission) {
      document.title = t("titles.submission_detail", { 
        name: submission.studentName, 
        id: submission.studentId || "N/A" 
      });
    }
  }, [submission, t]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-bold animate-pulse">{t("common.loading_submission")}</p>
    </div>
  );

  if (!submission) return null;

  const scoreColor = submission.score >= 8 ? "text-emerald-500" : submission.score >= 5 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="space-y-8 pb-20 relative">
      <div id="top-of-page" className="absolute -top-20" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(`/dashboard/teacher/rooms/${roomId}`)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:border-primary/50 rounded-xl transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
              {t("rooms.detail.back") || "Quay lại"}
            </span>
          </button>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-60 shrink-0">{t("rooms.detail.student_name")}:</span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-foreground">{submission.studentName}</h1>
            </div>
            <div className="flex items-center gap-3 md:border-l md:border-border md:pl-10">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-60 shrink-0">{t("rooms.detail.student_id")}:</span>
              <p className="text-xl md:text-2xl font-black text-primary tracking-tight leading-none">{submission.studentId || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {submission.allAttemptIds?.length > 1 && (
            <div className="relative group/dropdown">
              <div className="bg-card border border-border rounded-[2rem] p-2 px-5 flex items-center gap-3 shadow-sm hover:border-primary/50 transition-all cursor-pointer">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("common.attempts")}:</span>
                <span className="font-black text-primary text-sm flex items-center gap-1.5">
                  {t("common.step")} {submission.attemptNumber}
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 p-1.5 min-w-[140px]">
                {submission.allAttemptIds.map((id, i) => (
                  <button
                    key={id}
                    onClick={() => navigate(`/dashboard/teacher/rooms/${roomId}/submissions/${id}`)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between",
                      submissionId === id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t("common.step")} {i + 1}
                    {submissionId === id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-[2rem] p-4 px-8 flex items-center gap-6 shadow-sm">
            <div className="text-center">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("common.attempts")}</p>
               <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xl font-black text-primary">{submission.attemptNumber}</span>
                  <span className="text-muted-foreground font-bold">/</span>
                  <span className="text-muted-foreground font-bold">{submission.maxAttempts > 0 ? submission.maxAttempts : "∞"}</span>
               </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.detail.grading.final_score")}</p>
              <p className={cn("text-3xl font-black tabular-nums", scoreColor)}>{submission.score.toFixed(1)}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("common.correctCount")}</p>
              <p className="text-xl font-black">{submission.correctCount} / {submission.totalQuestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">{t("dashboard.recentQuizzes.table.date")}</p>
            <p className="font-bold text-[11px] truncate">{new Date(submission.submittedAt).toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={handleToggleGradedStatus}
          disabled={isTogglingGraded}
          className={cn(
            "bg-card border border-border rounded-2xl p-3 flex items-center gap-4 text-left transition-all hover:shadow-lg active:scale-95 group shrink-0",
            submission.isGraded ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0",
            submission.isGraded ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
          )}>
            <ShieldIcon className={cn("w-4 h-4", isTogglingGraded && "animate-spin")} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">{t("rooms.detail.grading_status")}</p>
            <p className={cn("font-bold text-[11px] truncate", submission.isGraded ? "text-emerald-600" : "text-amber-600")}>
              {submission.isGraded ? t("common.fully_graded") : t("common.pending_confirmation")}
            </p>
          </div>
        </button>

        <button 
          onClick={handleToggleIndividualPublish}
          disabled={isIndividualPublishing}
          className={cn(
            "bg-card border border-border rounded-2xl p-3 flex items-center gap-4 text-left transition-all hover:shadow-lg active:scale-95 group shrink-0",
            submission.published ? "border-primary/30 bg-primary/5" : "border-muted-foreground/30 bg-muted/5"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0",
            submission.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {submission.published ? <Eye className={cn("w-4 h-4", isIndividualPublishing && "animate-spin")} /> : <EyeOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">{t("rooms.detail.publish_score")}</p>
            <p className={cn("font-bold text-[11px] truncate", submission.published ? "text-primary" : "text-muted-foreground")}>
              {submission.published ? t("rooms.detail.status_published") : t("rooms.detail.status_unpublished")}
            </p>
          </div>
        </button>

        <div className={cn(
            "bg-card border border-border rounded-2xl p-3 flex items-center gap-4 shrink-0",
            room?.scoresPublished ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
          )}>
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
            room?.scoresPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">{t("rooms.detail.master_publish")}</p>
            <p className={cn("font-bold text-[11px] truncate", room?.scoresPublished ? "text-emerald-600" : "text-rose-600")}>
              {room?.scoresPublished ? t("rooms.detail.status_published") : t("rooms.detail.status_unpublished")}
            </p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2 px-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          {t("rooms.detail.submission_details")}
        </h2>

        {submission.answers?.map((ans, idx) => {
          const isEssay = ans.questionType === "essay";
          const isCorrect = ans.isCorrect || ans.correct; // Support both naming conventions
          const hasData = !!ans.questionContent;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className={cn(
                "bg-card border rounded-[2.5rem] p-6 md:p-8 space-y-6 transition-all shadow-sm",
                !hasData ? "border-dashed border-muted-foreground/20 opacity-70" :
                isEssay ? "border-primary/20 bg-primary/[0.01]" : 
                isCorrect ? "border-emerald-500/20" : "border-rose-500/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("rooms.detail.question_num", { num: idx + 1 })}
                  </span>
                  {hasData ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      isEssay ? "bg-primary/10 text-primary" : 
                      isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {isEssay ? t("common.essay") : isCorrect ? t("common.correct") : t("common.incorrect")}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Lỗi dữ liệu câu hỏi
                    </span>
                  )}
                  {ans.manuallyGraded && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t("rooms.detail.grading.manually_graded")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.detail.grading.score")}: </p>
                   <p className={cn("text-lg font-black", isCorrect ? "text-emerald-500" : "text-rose-500")}>
                     {isCorrect ? (10 / submission.totalQuestions).toFixed(2) : "0.0"}
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold leading-tight">
                  {ans.questionContent || t("rooms.detail.grading.content_unavailable")}
                </h3>
                
                {isEssay ? (
                  <div className="space-y-6">
                    {/* Student Answer */}
                    <div className="bg-muted/30 border-2 border-border rounded-3xl p-6 relative">
                       <p className="absolute -top-3 left-6 bg-background px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                         {t("rooms.detail.grading.student_answer")}
                       </p>
                       <p className="text-base font-medium whitespace-pre-wrap leading-relaxed">
                         {ans.essayAnswer || t("rooms.detail.grading.no_answer")}
                       </p>
                    </div>

                    {/* AI Feedback */}
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-widest">{t("rooms.detail.grading.ai_suggestion")}</span>
                         </div>
                         <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              ans.aiScore >= 5 ? "text-emerald-500" : "text-rose-500"
                            )}>
                              AI: {ans.aiScore >= 5 ? "Đúng" : "Sai"}
                            </span>
                         </div>
                       </div>
                       <p className="text-sm text-muted-foreground leading-relaxed italic">
                         {ans.aiComment || "AI chưa đưa ra nhận xét cho câu hỏi này."}
                       </p>
                    </div>

                    {/* Grading Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 border-t border-border/50">
                       <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Chấm điểm ngay:</p>
                       <div className="flex gap-3">
                          <button
                            onClick={() => handleGrade(ans.submissionAnswerId, false)}
                            disabled={isGrading}
                            className={cn(
                              "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                              ans.manuallyGraded && ans.finalScore === 0 
                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                                : "bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                            )}
                          >
                            <X className="w-4 h-4" />
                            {t("rooms.detail.grading.reject")}
                          </button>
                          <button
                            onClick={() => handleGrade(ans.submissionAnswerId, true)}
                            disabled={isGrading}
                            className={cn(
                              "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                              ans.manuallyGraded && ans.finalScore > 0 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500"
                            )}
                          >
                            <Check className="w-4 h-4" />
                            {t("rooms.detail.grading.accept")}
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ans.choices?.map((choice, cIdx) => {
                        const isStudentSelected = ans.selectedAnswer?.includes(choice.key);
                        const isCorrectChoice = ans.correctAnswers?.includes(choice.key);
                        
                        let choiceStyle = "bg-muted/30 border-transparent text-muted-foreground";
                        if (isCorrectChoice) choiceStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700";
                        else if (isStudentSelected && !isCorrectChoice) choiceStyle = "bg-rose-500/10 border-rose-500 text-rose-700";

                        return (
                          <div 
                            key={cIdx}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                              choiceStyle
                            )}
                          >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border shadow-sm",
                            isCorrectChoice ? "bg-emerald-500 text-white border-emerald-500" : 
                            isStudentSelected ? "bg-rose-500 text-white border-rose-500" : "bg-muted text-muted-foreground border-border/50"
                          )}>
                            {String.fromCharCode(65 + cIdx)}
                          </div>
                            <span className="font-bold text-sm">{choice.content}</span>
                            <div className="ml-auto flex items-center gap-2">
                              {isCorrectChoice && (
                                <>
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md",
                                    isStudentSelected ? "bg-white/20 text-white" : "bg-emerald-500 text-white"
                                  )}>
                                    {isStudentSelected ? t("rooms.detail.grading.student_selected_correct") : t("rooms.detail.grading.correct_answer_label")}
                                  </span>
                                  <CheckCircle2 className="w-4 h-4" />
                                </>
                              )}
                              {!isCorrectChoice && isStudentSelected && (
                                <>
                                  <span className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-rose-500 text-white rounded-md">
                                    {t("rooms.detail.grading.student_selected_incorrect")}
                                  </span>
                                  <XCircle className="w-4 h-4" />
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Re-grading for MCQ */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 border-t border-border/50">
                       <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("rooms.detail.grading.regrade")}:</p>
                       <div className="flex gap-3">
                          <button
                            onClick={() => handleGrade(ans.submissionAnswerId, false)}
                            disabled={isGrading}
                            className={cn(
                              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2",
                              ans.manuallyGraded && ans.finalScore === 0 
                                ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20" 
                                : "bg-muted border-transparent text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20"
                            )}
                          >
                            <X className="w-3.5 h-3.5" />
                            {t("rooms.detail.grading.incorrect")}
                          </button>
                          <button
                            onClick={() => handleGrade(ans.submissionAnswerId, true)}
                            disabled={isGrading}
                            className={cn(
                              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2",
                              ans.manuallyGraded && ans.finalScore > 0 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-muted border-transparent text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20"
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {t("rooms.detail.grading.correct")}
                          </button>
                       </div>
                    </div>
                  </>
                )}
              </div>

              {/* Correct Answer / Explanation Section */}
              {isEssay ? (
                (ans.explanation || ans.sampleAnswer) && (
                  <div className="pt-6 border-t border-border/50">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.detail.grading.correct_answer")}</p>
                      <p className="text-sm font-medium leading-relaxed bg-muted/20 p-4 rounded-2xl border border-dashed border-border whitespace-pre-wrap">
                        {ans.explanation || ans.sampleAnswer}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                (ans.sampleAnswer || ans.explanation) && (
                  <div className="pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ans.sampleAnswer && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.detail.grading.correct_answer")}</p>
                        <p className="text-sm font-medium leading-relaxed bg-muted/20 p-4 rounded-2xl border border-dashed border-border">{ans.sampleAnswer}</p>
                      </div>
                    )}
                    {ans.explanation && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.detail.grading.explanation")}</p>
                        <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">{ans.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Back to Top Button */}
      <motion.button
        title="Quay lại đầu trang"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          document.getElementById('top-of-page')?.scrollIntoView({ behavior: 'smooth' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-primary/90 transition-all border-4 border-background"
      >
        <ChevronLeft className="w-6 h-6 rotate-90" />
      </motion.button>
    </div>
  );
}
