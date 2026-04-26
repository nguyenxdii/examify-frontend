import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Loader2, CheckCircle2, XCircle, 
  AlertCircle, MessageSquare, Award, Clock, User, 
  BookOpen, Sparkles, Check, X, ShieldCheck
} from "lucide-react";
import { getSubmissionDetail, gradeEssay } from "../../../api/roomApi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { toast } from "react-hot-toast";

export default function SubmissionDetail() {
  const { t } = useTranslation();
  const { roomId, submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [roomId, submissionId]);

  const fetchDetail = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getSubmissionDetail(roomId, submissionId);
      setSubmission(res.data);
    } catch (error) {
      toast.error(t("rooms.fetch_error"));
      navigate(`/dashboard/teacher/rooms/${roomId}`);
    } finally {
      if (!silent) setLoading(false);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  if (!submission) return null;

  const scoreColor = submission.score >= 8 ? "text-emerald-500" : submission.score >= 5 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="space-y-8 pb-20 relative">
      <div id="top-of-page" className="absolute -top-20" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(`/dashboard/teacher/rooms/${roomId}`)}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("rooms.detail.back")}
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{submission.studentName}</h1>
              <p className="text-muted-foreground font-medium">ID: {submission.studentId || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-card border border-border rounded-[2rem] p-4 px-8 flex items-center gap-6 shadow-sm">
            <div className="text-center">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Lượt thi</p>
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
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.detail.card.submissions")}</p>
              <p className="text-xl font-black">{submission.correctCount} / {submission.totalQuestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-[2rem] p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thời gian nộp</p>
            <p className="font-bold">{new Date(submission.submittedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trạng thái chấm</p>
            <p className={cn(
              "font-black uppercase text-[11px] tracking-tight",
              submission.gradingStatus === "fully_graded" ? "text-emerald-500" : "text-amber-500"
            )}>
              {submission.gradingStatus === "fully_graded" ? t("rooms.detail.grading.status_graded") : t("rooms.detail.grading.status_pending")}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Xác thực</p>
            <p className="font-bold">Đã xác minh danh tính</p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2 px-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          Chi tiết từng câu hỏi
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
                    Câu {idx + 1}
                  </span>
                  {hasData ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      isEssay ? "bg-primary/10 text-primary" : 
                      isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {isEssay ? "Tự luận" : isCorrect ? "Đúng" : "Sai"}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Lỗi dữ liệu câu hỏi
                    </span>
                  )}
                  {ans.manuallyGraded && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Đã chấm thủ công
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Điểm: </p>
                   <p className={cn("text-lg font-black", isCorrect ? "text-emerald-500" : "text-rose-500")}>
                     {isCorrect ? (10 / submission.totalQuestions).toFixed(2) : "0.0"}
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold leading-tight">
                  {ans.questionContent || "Nội dung câu hỏi không khả dụng (có thể đã bị xóa khỏi snapshot)"}
                </h3>
                
                {isEssay ? (
                  <div className="space-y-6">
                    {/* Student Answer */}
                    <div className="bg-muted/30 border-2 border-border rounded-3xl p-6 relative">
                       <p className="absolute -top-3 left-6 bg-background px-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                         {t("rooms.detail.grading.student_answer")}
                       </p>
                       <p className="text-base font-medium whitespace-pre-wrap leading-relaxed">
                         {ans.essayAnswer || "(Học sinh không nộp câu trả lời)"}
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
                              "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                              isCorrectChoice ? "bg-emerald-500 text-white" : 
                              isStudentSelected ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                            )}>
                              {String.fromCharCode(65 + cIdx)}
                            </div>
                            <span className="font-bold text-sm">{choice.content}</span>
                            <div className="ml-auto">
                              {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {isStudentSelected && !isCorrectChoice && <XCircle className="w-4 h-4 text-rose-500" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Re-grading for MCQ */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 border-t border-border/50">
                       <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Chấm lại:</p>
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
                            Sai
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
                            Đúng
                          </button>
                       </div>
                    </div>
                  </>
                )}
              </div>

              {/* Correct Answer / Explanation Section */}
              {(ans.sampleAnswer || ans.explanation) && (
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
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Back to Top Button */}
      <motion.button
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
