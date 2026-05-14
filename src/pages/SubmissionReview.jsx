import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Loader2, CheckCircle2, XCircle, 
  Clock, Sparkles, BarChart3,
  ChevronDown, Check, Lock, User,
  Calendar, Award, Hash, Zap,
  ChevronLeft, ArrowRight
} from "lucide-react";
import { lookupResult } from "../api/examApi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function SubmissionReview() {
  const { t, i18n } = useTranslation();
  const { submissionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const roomCode = searchParams.get("roomCode");
  const studentId = searchParams.get("studentId");

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    if (submission) {
      document.title = t("titles.review", { exam: submission.examTitle });
    } else {
      document.title = t("titles.review", { exam: "..." });
    }
  }, [submission, t]);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomCode || !studentId) {
        navigate("/lookup");
        return;
      }

      try {
        setLoading(true);
        const res = await lookupResult(studentId, roomCode);
        const sub = res.data.find(s => s.submissionId === submissionId);
        if (sub) {
          setSubmission(sub);
        } else {
          toast.error(t("lookup.noResult"));
          navigate("/lookup");
        }
      } catch (err) {
        toast.error(t("rooms.list.fetchError"));
        navigate("/lookup");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [submissionId, roomCode, studentId, navigate, t]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString(i18n.language === 'vi' ? "vi-VN" : "en-US", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) { return "N/A"; }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleTimeString(i18n.language === 'vi' ? "vi-VN" : "en-US", { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) { return "N/A"; }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-bold animate-pulse text-sm">{t("common.loading")}</p>
    </div>
  );

  if (!submission) return null;

  const scoreColor = submission.score >= 8 ? "text-emerald-500" : submission.score >= 5 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      {/* Top Banner / Hero Background */}
      <div className="relative pt-12 pb-24 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-6xl mx-auto px-4 relative">
           <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:border-primary/50 rounded-xl transition-all shadow-sm"
           >
            <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
              {t("common.back") || "Quay lại"}
            </span>
           </button>

           <div className="text-center pt-8">
             <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-3xl font-black text-foreground tracking-tighter mb-2 leading-tight"
             >
              {submission.examTitle}
             </motion.h1>
             <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]"
             >
              {t("common.attempts")} {submission.attemptNumber} / {submission.maxAttempts > 0 ? submission.maxAttempts : t("common.unlimited")}
             </motion.p>
           </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 -mt-16 pb-20 space-y-8 relative z-10">
        {!submission.published && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-4 rounded-2xl flex items-start gap-3 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="font-bold text-sm text-justify leading-relaxed whitespace-pre-line">{t("rooms.quiz_result.notes.score_only_mc")}</p>
            </div>
          </motion.div>
        )}

        {/* Main Identity & Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/90 backdrop-blur-xl border border-border rounded-[2rem] p-6 md:p-8 shadow-2xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Score Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4 lg:border-r lg:border-border/50 lg:pr-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-muted flex flex-col items-center justify-center relative">
                   {(!submission.published && !submission.showScoreAfterSubmission) ? (
                    <div className="flex flex-col items-center gap-1 text-primary/30">
                      <Lock className="w-8 h-8" />
                      <span className="text-[9px] font-black tracking-widest uppercase">{t('common.pending_announcement')}</span>
                    </div>
                  ) : (submission.score === null || submission.score === undefined) ? (
                    <div className="flex flex-col items-center gap-1 text-amber-500/50">
                      <Clock className="w-8 h-8 animate-spin-slow" />
                      <span className="text-[9px] font-black tracking-widest uppercase">{t("common.pending")}</span>
                    </div>
                  ) : (
                    <>
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("text-5xl md:text-6xl font-black tracking-tighter leading-none", scoreColor)}
                      >
                        {submission.score.toFixed(1)}
                      </motion.span>
                      <span className="text-xs font-black text-muted-foreground/20">/ 10</span>
                    </>
                  )}
                  
                  {/* Outer Ring Progress */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="48%"
                      className={cn("fill-none stroke-current stroke-[4px] transition-all duration-1000 ease-out", 
                        submission.gradingStatus === "fully_graded" ? scoreColor : "text-transparent"
                      )}
                      strokeDasharray="100 100"
                      strokeDashoffset={100 - (submission.score * 10)}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className={cn("px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border", 
                (submission.gradingStatus === "fully_graded" || submission.gradingStatus === "auto_graded" || submission.gradingStatus === "ai_graded_essay") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-transparent"
              )}>
                {(submission.gradingStatus === "fully_graded" || submission.gradingStatus === "auto_graded" || submission.gradingStatus === "ai_graded_essay") ? t("common.fully_graded") : (submission.gradingStatus === "pending_announcement" ? t("common.pending_announcement") : t("common.pending"))}
              </div>
            </div>

            {/* Right: Info & Stats */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4 text-center lg:text-left">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest min-w-[70px]">{t("rooms.detail.student_name")}:</span>
                    <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-none">
                      {submission.studentName}
                    </h2>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest min-w-[70px]">{t("rooms.detail.student_id")}:</span>
                    <h2 className="text-lg md:text-xl font-black text-primary tracking-tight leading-none">
                      {submission.studentId}
                    </h2>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(submission.submittedAt || submission.createdAt)}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(submission.submittedAt || submission.createdAt)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-4 rounded-2xl space-y-1 group hover:bg-primary/5 transition-colors">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{t('common.correctCount')}</p>
                  <p className="text-lg font-black tabular-nums">
                    {(!submission.published && !submission.showScoreAfterSubmission)
                      ? <span className="opacity-20">--/--</span>
                      : `${submission.correctCount}/${submission.totalQuestions}`
                    }
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-2xl space-y-1 group hover:bg-amber-500/5 transition-colors">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{t('common.attempts')}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black">#{submission.attemptNumber}</p>
                    {submission.allAttemptIds?.length > 1 && (
                       <div className="relative group/dropdown">
                          <button className="bg-white dark:bg-card p-1 rounded-lg shadow-sm border border-border hover:border-primary transition-all">
                             <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 p-1 min-w-[140px]">
                            {submission.allAttemptIds.map((id, i) => (
                              <button
                                key={id}
                                onClick={() => navigate(`/lookup/submission/${id}?roomCode=${roomCode}&studentId=${studentId}`)}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-between",
                                  submissionId === id ? "bg-primary text-white" : "hover:bg-muted"
                                )}
                              >
                                {t('common.step')} {i + 1}
                                {submissionId === id && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t("rooms.detail.tab_submissions")}
            </h3>
          </div>

          {!submission.showSubmission ? (
            <div className="bg-card border-2 border-dashed border-border rounded-[2rem] p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto relative group">
                <Lock className="w-8 h-8 text-primary/30 group-hover:scale-110 transition-transform" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-black text-foreground">
                  {submission.gradingStatus === "pending_announcement" 
                    ? t("common.pending_announcement") 
                    : t("rooms.detail.answers_hidden_title")}
                </h3>
                <p className="text-muted-foreground font-medium text-sm">
                  {submission.gradingStatus === "pending_announcement"
                    ? t("common.waiting_for_announcement")
                    : t("rooms.detail.answers_hidden_desc")}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submission.answers.map((ans, idx) => {
                const isEssay = ans.questionType === "essay";
                const isCorrect = ans.isCorrect;
                
                return (
                  <motion.div 
                    key={ans.submissionAnswerId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx % 5 * 0.05 }}
                    className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                  >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                            {t("rooms.detail.question_num", { num: idx + 1 })}
                          </span>
                        </div>
                        
                        {submission.showAnswers && !isEssay && ans.correctAnswers && ans.correctAnswers.length > 0 && (
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                            isCorrect ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-rose-500/5 text-rose-500 border-rose-500/20"
                          )}>
                            {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {isCorrect ? t("common.correct") : t("common.incorrect")}
                          </div>
                        )}
                        {isEssay && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/5 text-amber-600 rounded-full border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">
                             <Sparkles className="w-3.5 h-3.5" /> {ans.aiScore > 0 ? t("common.ai_graded") : t("common.pending")}
                          </div>
                        )}
                      </div>

                    <MarkdownRenderer 
                      content={ans.questionContent} 
                      className="text-xl font-black text-foreground leading-tight tracking-tight"
                    />

                    {isEssay ? (
                      <div className="space-y-5">
                        <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-3">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{t("rooms.detail.grading.student_answer")}</p>
                          <MarkdownRenderer 
                            content={ans.essayAnswer || `(${t("common.empty")})`} 
                            className="text-base font-medium leading-relaxed"
                          />
                        </div>
                        {ans.aiComment && (
                          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                              <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> {t("rooms.detail.grading.ai_suggestion")}
                              </p>
                              <p className="text-[10px] font-black text-primary bg-white dark:bg-card px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                                {t("rooms.detail.score")}: {ans.aiScore.toFixed(1)}/10
                              </p>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed italic relative z-10">{ans.aiComment}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {ans.choices?.map((choice, cIdx) => {
                          const label = String.fromCharCode(65 + cIdx);
                          const isSelected = ans.selectedAnswer?.includes(choice.key);
                          const hasCorrectAnswers = ans.correctAnswers && ans.correctAnswers.length > 0;
                          const isCorrectChoice = hasCorrectAnswers && ans.correctAnswers.includes(choice.key);
                          
                          let choiceStyle = "bg-card border-border text-muted-foreground";
                          if (hasCorrectAnswers) {
                            if (isSelected && isCorrectChoice) choiceStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-600";
                            else if (isSelected && !isCorrectChoice) choiceStyle = "bg-rose-500/10 border-rose-500/50 text-rose-600";
                            else if (!isSelected && isCorrectChoice) choiceStyle = "bg-emerald-500/5 border-emerald-500/20 text-emerald-600/60";
                          } else {
                            if (isSelected) choiceStyle = "bg-primary/10 border-primary/50 text-primary";
                          }
    
                          return (
                            <div 
                              key={choice.key}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all relative overflow-hidden",
                                choiceStyle
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors border shadow-sm",
                                isSelected || isCorrectChoice ? "bg-white dark:bg-card border-primary/20" : "bg-muted text-muted-foreground border-border/50"
                              )}>
                                {label}
                              </div>
                              <span className="flex-1 text-base font-bold">{choice.content}</span>
                              
                              {hasCorrectAnswers && isCorrectChoice && (
                                 <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-emerald-500 text-white rounded-full">
                                      {isSelected ? t("rooms.detail.you_chose_correct") : t("rooms.detail.correct_answer")}
                                    </span>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                 </div>
                               )}
                               {hasCorrectAnswers && !isCorrectChoice && isSelected && (
                                 <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-rose-500 text-white rounded-full">
                                      {t("rooms.detail.you_chose_incorrect")}
                                    </span>
                                    <XCircle className="w-4 h-4 text-rose-500" />
                                 </div>
                               )}
                               {!hasCorrectAnswers && isSelected && (
                                 <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-primary text-white rounded-full">
                                      {t("rooms.detail.you_chose")}
                                    </span>
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                 </div>
                               )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Explanations */}
                    {submission.showAnswers && (ans.explanation || (isEssay && ans.sampleAnswer)) && (
                      <div className="mt-6 p-6 bg-muted/10 rounded-2xl border border-border/50 relative group/exp">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            {isEssay ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Clock className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {isEssay ? t("rooms.detail.grading.correct_answer") : t("rooms.detail.grading.explanation")}
                          </p>
                        </div>
                        <MarkdownRenderer 
                          content={isEssay ? (ans.explanation || ans.sampleAnswer) : ans.explanation} 
                          className="text-base md:text-lg font-bold text-foreground leading-relaxed text-justify hyphens-auto"
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
