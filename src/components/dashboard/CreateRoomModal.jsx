import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Plus, 
  Layout, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Users,
  ChevronRight,
  Monitor,
  Zap,
  Eye,
  BookOpen,
  FileQuestion,
  Info,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { getMyExams } from "../../api/examApi";
import { createRoom } from "../../api/roomApi";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function CreateRoomModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    examId: "",
    name: "",
    mode: "exam",
    durationMinutes: 60,
    openAt: "",
    closeAt: "",
    maxAttempts: 1,
    showAnswerAfter: false,
    requireStudentList: false
  });

  // Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchExams = async () => {
        try {
          setLoadingExams(true);
          const res = await getMyExams();
          setExams(res.data);
          if (res.data.length > 0 && !formData.examId) {
            setFormData(prev => ({ ...prev, examId: res.data[0].id }));
          }
        } catch (err) {
          toast.error("Error loading exams list");
        } finally {
          setLoadingExams(false);
        }
      };
      fetchExams();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        openAt: formData.openAt ? new Date(formData.openAt).toISOString() : null,
        closeAt: formData.closeAt ? new Date(formData.closeAt).toISOString() : null
      };

      const res = await createRoom(submitData);
      toast.success(t("rooms.create_success"));
      onSuccess(res.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || t("rooms.create_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const isPractice = formData.mode === "practice";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading">
                    {t("rooms.create_modal_title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("rooms.subtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Exam Selection - Enhanced with larger scroll surface if possible */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80">
                    <Layout className="w-4 h-4 text-primary" /> {t("rooms.form.exam")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      required
                      value={formData.examId}
                      onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading appearance-none cursor-pointer text-sm hover:bg-muted/80"
                    >
                      <option value="">-- {t("rooms.form.select_exam")} --</option>
                      {exams.map(ex => (
                        <option key={ex.id} value={ex.id} className="py-2">
                          {ex.title}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 opacity-40 pointer-events-none transition-transform group-hover:scale-110" />
                  </div>
                </div>

                {/* Room Name */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80">
                    <Monitor className="w-4 h-4 text-primary" /> {t("rooms.form.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("rooms.form.name_placeholder")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80">
                      <Zap className="w-4 h-4 text-primary" /> {t("rooms.form.mode")}
                    </label>
                    <div className="flex bg-muted p-1 rounded-2xl h-[48px]">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mode: "exam" })}
                        className={`flex-1 rounded-xl text-[11px] font-bold transition-all ${
                          formData.mode === "exam" 
                            ? "bg-primary text-white shadow-md shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted-foreground/10"
                        }`}
                      >
                        {t("rooms.mode.exam")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mode: "practice" })}
                        className={`flex-1 rounded-xl text-[11px] font-bold transition-all ${
                          formData.mode === "practice" 
                            ? "bg-primary text-white shadow-md shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted-foreground/10"
                        }`}
                      >
                        {t("rooms.mode.practice")}
                      </button>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80">
                      <Clock className="w-4 h-4 text-primary" /> {t("rooms.form.duration")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                        className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading pr-14 text-sm font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50 uppercase">{t("rooms.detail.minutes")}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Open At */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80">
                      <Calendar className="w-4 h-4 text-primary" /> {t("rooms.form.open_at")}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.openAt}
                      onChange={(e) => setFormData({ ...formData, openAt: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-[13px] font-medium"
                    />
                  </div>

                  {/* Close At */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80">
                      <Calendar className="w-4 h-4 text-primary" /> {t("rooms.form.close_at")}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.closeAt}
                      onChange={(e) => setFormData({ ...formData, closeAt: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-[13px] font-medium"
                    />
                  </div>
                </div>

                {/* Advanced Section: Max Attempts & Toggle Switches */}
                {!isPractice && (
                  <div className="pt-2 space-y-4">
                    <div className="h-px bg-border/20 mx-1" />
                    
                    {/* Max Attempts Row */}
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[13px] font-bold flex items-center gap-2 text-foreground/80">
                        <Plus className="w-4 h-4 text-primary rotate-45" /> {t("rooms.form.max_attempts")}
                      </label>
                      <div className="w-24 relative">
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.maxAttempts}
                          onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                          className="w-full bg-muted/50 border border-border rounded-xl p-2 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-sm"
                        />
                      </div>
                    </div>

                    {/* Toggle Switches */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-2xl border border-border/10">
                        <div className="flex items-center gap-3">
                          <Eye className="w-4 h-4 text-primary/70" />
                          <span className="text-[13px] font-bold text-foreground/80">{t("rooms.form.show_answer")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, showAnswerAfter: !p.showAnswerAfter }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            formData.showAnswerAfter ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`${
                              formData.showAnswerAfter ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-2xl border border-border/10">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-primary/70" />
                          <span className="text-[13px] font-bold text-foreground/80">{t("rooms.form.require_list")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, requireStudentList: !p.requireStudentList }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            formData.requireStudentList ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`${
                              formData.requireStudentList ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3 bg-muted/30">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-4 rounded-2xl transition-all"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={submitting || !formData.examId || !formData.name}
                className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  t("rooms.form.submit")
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

