import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertCircle, Save, Sparkles, User } from "lucide-react";
import { getSubmissionDetail, gradeEssay } from "../../api/roomApi";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function SubmissionDetailModal({ isOpen, onClose, roomId, submissionId, onGraded }) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState({}); 

  useEffect(() => {
    if (isOpen && submissionId) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const res = await getSubmissionDetail(roomId, submissionId);
          setDetail(res.data);
          
          const initialGrades = {};
          res.data.answers.forEach(ans => {
            if (ans.essayAnswer) {
              initialGrades[ans.questionId] = ans.finalScore || 0;
            }
          });
          setGrades(initialGrades);
        } catch (err) {
          toast.error(t("rooms.fetch_error") || "Không thể tải chi tiết bài làm");
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, submissionId, roomId, t]);

  const submitGrade = async (ans, score, confirm = true) => {
     try {
        setSaving(true);
        await gradeEssay(roomId, submissionId, {
            submissionAnswerId: ans.submissionAnswerId || ans.id, 
            finalScore: parseFloat(score),
            confirm: confirm
        });
        toast.success(t("rooms.grade_success") || "Đã cập nhật điểm");
        onGraded();
        const res = await getSubmissionDetail(roomId, submissionId);
        setDetail(res.data);
     } catch (error) {
        toast.error((t("rooms.grade_error") || "Lỗi chấm điểm: ") + (error.response?.data?.message || ""));
     } finally {
        setSaving(false);
     }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                 <User className="w-7 h-7 text-primary" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold">{detail?.studentName || (t("common.loading") || "Đang tải...")}</h2>
                 <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                   <span className="bg-muted px-2 py-0.5 rounded-lg">{detail?.studentId}</span>
                   <span className="opacity-40">•</span>
                   <span className="text-primary font-bold">{detail?.score?.toFixed(1)} / {detail?.totalQuestions} {t("dashboard.stats.avgScore")}</span>
                 </p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-muted rounded-full transition-all group">
              <X className="w-7 h-7 text-muted-foreground group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground font-medium italic animate-pulse">{t("wizard.step4.generating") || "Đang phân tích bài làm..."}</p>
              </div>
            ) : (
              detail.answers.map((ans, index) => (
                <div key={index} className={`p-8 rounded-[2rem] border relative group/ans ${
                  ans.essayAnswer 
                  ? "bg-muted/5 border-border" 
                  : ans.correct 
                    ? "bg-green-500/5 border-green-500/20" 
                    : "bg-red-500/5 border-red-500/20"
                }`}>
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                          {t("wizard.common.step")} {index + 1}
                        </span>
                        {ans.essayAnswer && <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter italic">Essay</span>}
                      </div>
                      <h4 className="text-xl font-bold leading-tight">{ans.questionContent}</h4>
                    </div>
                    {!ans.essayAnswer && (
                      <div className="shrink-0">
                        {ans.correct ? (
                          <div className="flex items-center gap-1.5 text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-xl text-xs uppercase border border-green-500/20">
                            <CheckCircle2 className="w-4 h-4"/> {t("rooms.card.submissions")}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-xl text-xs uppercase border border-red-500/20">
                            <XCircle className="w-4 h-4"/> {t("rooms.detail.no")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!ans.essayAnswer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {ans.choices?.map(choice => {
                        const isSelected = ans.selectedAnswer?.includes(choice.key);
                        const isCorrect = ans.correctAnswers?.includes(choice.key);
                        return (
                          <div 
                            key={choice.key}
                            className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between transition-all ${
                              isCorrect 
                                ? "bg-green-500/10 border-green-500/30 text-green-700 shadow-sm shadow-green-500/10" 
                                : isSelected 
                                  ? "bg-red-500/10 border-red-500/30 text-red-700 shadow-sm shadow-red-500/10"
                                  : "bg-muted/30 border-border text-muted-foreground opacity-60"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] border ${
                                isCorrect ? "bg-green-500 text-white border-transparent" : isSelected ? "bg-red-500 text-white border-transparent" : "bg-muted border-border"
                              }`}>
                                {choice.key}
                              </span>
                              {choice.content}
                            </span>
                            {isCorrect && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {ans.essayAnswer && (
                    <div className="space-y-6">
                      <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                         <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-[0.2em]">{t("rooms.detail.tab_submissions")}:</p>
                         <p className="whitespace-pre-wrap text-base font-medium leading-relaxed">{ans.essayAnswer}</p>
                      </div>

                      <div className="bg-orange-500/5 border border-orange-500/10 rounded-[1.5rem] p-6 space-y-4">
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest">
                          <Sparkles className="w-4 h-4" /> AI Feedback:
                        </div>
                        <p className="text-sm italic text-muted-foreground leading-relaxed">{ans.aiComment || "N/A"}</p>
                        <div className="flex items-center gap-4 pt-2">
                           <span className="text-xs font-bold uppercase tracking-widest opacity-40">AI Score:</span>
                           <span className="text-2xl font-black text-orange-500 bg-orange-500/10 px-4 py-1 rounded-xl">{ans.aiScore || 0}</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pt-4 border-t border-border/50">
                         <div className="flex items-center gap-4">
                            <label className="text-sm font-black uppercase tracking-widest opacity-60">Teacher Grade:</label>
                            <input 
                              type="number"
                              step="0.5"
                              value={grades[ans.questionId]}
                              onChange={(e) => setGrades({ ...grades, [ans.questionId]: e.target.value })}
                              className="w-28 bg-card border border-border rounded-2xl px-5 py-3 focus:ring-4 focus:ring-primary/20 outline-none font-bold text-center text-xl shadow-inner"
                            />
                         </div>
                         <button 
                           onClick={() => submitGrade(ans, grades[ans.questionId])}
                           disabled={saving}
                           className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 group"
                         >
                           {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />}
                           {t("rooms.form.submit") || "Xác nhận chấm điểm"}
                         </button>
                      </div>
                    </div>
                  )}

                  {ans.explanation && (
                    <div className="mt-6 pt-6 border-t border-border/50 text-sm text-muted-foreground flex items-start gap-3 italic">
                       <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 opacity-40" />
                       <p><span className="font-bold text-[10px] uppercase tracking-widest mr-2 bg-muted px-2 py-0.5 rounded-lg not-italic">EXPLANATION:</span> {ans.explanation}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
