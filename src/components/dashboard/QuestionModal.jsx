import { useState, useEffect } from "react";
import { X, Layout, Type, HelpCircle, BarChart3, ListChecks, Plus, Loader2, Database, Sparkles, ChevronDown } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { addQuestion, updateQuestion, getQuestionBank, suggestTopic } from "../../api/examApi";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import ConfirmationModal from "./ConfirmationModal";

export default function QuestionModal({ isOpen, onClose, examId, question = null, onSuccess, isAiPreview = false, isBankOnly = false }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [suggestingTopic, setSuggestingTopic] = useState(false);
  const [bankTopics, setBankTopics] = useState([]);
  const [saveToBankState, setSaveToBankState] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    type: "multiple_choice",
    choices: [
      { key: "A", content: "" },
      { key: "B", content: "" },
      { key: "C", content: "" },
      { key: "D", content: "" }
    ],
    correctAnswers: [],
    sampleAnswer: "",
    scoringCriteria: "",
    explanation: "",
    difficulty: "medium",
    topic: "",
    orderIndex: 0
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        choices: question.choices || [
          { key: "A", content: "" },
          { key: "B", content: "" },
          { key: "C", content: "" },
          { key: "D", content: "" }
        ],
        correctAnswers: question.correctAnswers || []
      });
    } else {
      setFormData({
        content: "",
        type: "multiple_choice",
        choices: [
          { key: "A", content: "" },
          { key: "B", content: "" },
          { key: "C", content: "" },
          { key: "D", content: "" }
        ],
        correctAnswers: [],
        sampleAnswer: "",
        scoringCriteria: "",
        explanation: "",
        difficulty: "medium",
        topic: "",
        orderIndex: 0
      });
    }
    setIsDirty(false);
    
    // Fetch bank topics
    const fetchTopics = async () => {
      try {
        const res = await axiosInstance.get("/exams/questions/topics");
        setBankTopics(res.data || []);
      } catch (err) {
        console.error("Failed to fetch topics", err);
      }
    };
    if (isOpen) fetchTopics();
  }, [question, isOpen]);

  const handleSuggestTopic = async () => {
    if (!formData.content.trim()) {
      toast.error(t("wizard.questionModal.validation.emptyContent") || "Vui lòng nhập nội dung câu hỏi để AI gợi ý chủ đề");
      return;
    }
    try {
      setSuggestingTopic(true);
      const res = await suggestTopic(formData.content);
      setFormData(prev => ({ ...prev, topic: res.data.topic }));
      toast.success(t("wizard.questionModal.ai_success") || "AI đã gợi ý chủ đề!");
    } catch (err) {
      toast.error(t("wizard.questionModal.ai_error") || "Lỗi khi gợi ý chủ đề");
    } finally {
      setSuggestingTopic(false);
    }
  };

  const toggleAnswer = (key) => {
    if (formData.type === "multiple_choice") {
      setFormData({ ...formData, correctAnswers: [key] });
    } else {
      const current = formData.correctAnswers;
      if (current.includes(key)) {
        setFormData({ ...formData, correctAnswers: current.filter(k => k !== key) });
      } else {
        setFormData({ ...formData, correctAnswers: [...current, key] });
      }
    }
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    setIsDirty(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAiPreview) {
      onSuccess(formData);
      onClose();
      return;
    }

    if (formData.type === "multiple_choice") {
      if (formData.correctAnswers.length !== 1) {
        toast.error(t("wizard.questionModal.validation.singleChoice") || "Vui lòng chọn 1 đáp án đúng");
        return;
      }
    } else if (formData.type === "multiple_answer") {
      if (formData.correctAnswers.length < 2) {
        toast.error(t("wizard.questionModal.validation.multipleChoice") || "Vui lòng chọn ít nhất 2 đáp án đúng");
        return;
      }
    }

    setLoading(true);
    try {
      const { id, ...payload } = formData;
      if (isBankOnly) {
        const { updateBankQuestion, saveToBank } = await import("../../api/examApi");
        if (question?.id) {
          await updateBankQuestion(question.id, payload);
          toast.success(t("common.update_success") || "Đã cập nhật câu hỏi trong ngân hàng");
        } else {
          await saveToBank(payload);
          toast.success(t("common.add_success") || "Đã thêm câu hỏi vào ngân hàng");
        }
      } else {
        if (question?.id) {
          await updateQuestion(examId, question.id, { ...payload, saveToBank: saveToBankState });
        } else {
          await addQuestion(examId, { ...payload, saveToBank: saveToBankState });
        }
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t("wizard.questionModal.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-xl font-bold font-heading text-foreground">
                  {question ? t("wizard.questionModal.editTitle") : t("wizard.questionModal.addTitle")}
                </h3>
              </div>
              <button onClick={handleClose} type="button" className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold font-heading flex items-center gap-2 text-foreground/80">
                    <Layout className="w-4 h-4 text-primary/60" /> {t("wizard.questionModal.type")}
                  </label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      type: e.target.value, 
                      correctAnswers: [],
                      choices: e.target.value === "essay" ? [] : [
                        { key: "A", content: "" },
                        { key: "B", content: "" },
                        { key: "C", content: "" },
                        { key: "D", content: "" }
                      ]
                    })}
                    className="w-full bg-muted/50 border border-border rounded-xl p-2.5 focus:ring-2 focus:ring-primary/50 outline-none font-sans"
                  >
                    <option value="multiple_choice">{t("wizard.step5.types.mc")}</option>
                    <option value="multiple_answer">{t("wizard.step5.types.ma")}</option>
                    <option value="essay">{t("wizard.step5.types.essay")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold font-heading flex items-center gap-2 text-foreground/80">
                    <BarChart3 className="w-4 h-4 text-primary/60" /> {t("wizard.questionModal.difficulty")}
                  </label>
                  <select 
                    value={formData.difficulty} 
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-xl p-2.5 focus:ring-2 focus:ring-primary/50 outline-none font-sans"
                  >
                    <option value="easy">{t("wizard.step3.difficultyLevels.easy")}</option>
                    <option value="medium">{t("wizard.step3.difficultyLevels.medium")}</option>
                    <option value="hard">{t("wizard.step3.difficultyLevels.hard")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-heading flex items-center gap-2 text-foreground/80">
                  <Type className="w-4 h-4 text-primary/60" /> {t("wizard.questionModal.content")}
                </label>
                <textarea 
                  required 
                  rows="3" 
                  value={formData.content} 
                  onChange={(e) => {
                    setFormData({...formData, content: e.target.value});
                    setIsDirty(true);
                  }}
                  placeholder={t("wizard.questionModal.placeholderQuestion")}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none font-sans"
                />
              </div>

              {formData.type !== "essay" && (
                <div className="space-y-4">
                  <label className="text-sm font-bold font-heading flex items-center gap-2 text-foreground/80">
                    <ListChecks className="w-4 h-4 text-primary/60" /> {t("wizard.questionModal.choices")}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {formData.choices.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => toggleAnswer(c.key)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border-2 flex-shrink-0",
                            formData.correctAnswers.includes(c.key) 
                              ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" 
                              : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          {c.key}
                        </button>
                        <input 
                          type="text" 
                          required 
                          value={c.content} 
                          onChange={(e) => {
                            const newChoices = [...formData.choices];
                            newChoices[i].content = e.target.value;
                            setFormData({...formData, choices: newChoices});
                            setIsDirty(true);
                          }}
                          placeholder={`${t("wizard.questionModal.placeholderChoice")} ${c.key}...`}
                          className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none font-sans"
                        />
                        {formData.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newChoices = formData.choices.filter((_, idx) => idx !== i);
                              const keys = ["A","B","C","D","E","F","G","H","I","J"];
                              const updatedChoices = newChoices.map((choice, index) => ({
                                ...choice,
                                key: keys[index]
                              }));
                              setFormData({ ...formData, choices: updatedChoices, correctAnswers: [] });
                            }}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.choices.length < 10 && (
                    <button
                      type="button"
                      onClick={() => {
                        const keys = ["A","B","C","D","E","F","G","H","I","J"];
                        const nextKey = keys[formData.choices.length];
                        setFormData({
                          ...formData,
                          choices: [...formData.choices, { key: nextKey, content: "" }]
                        });
                      }}
                      className="flex items-center gap-2 text-sm text-primary font-bold px-4 py-2 rounded-xl hover:bg-primary/10 transition-all w-fit"
                    >
                      <Plus className="w-4 h-4" /> {t("wizard.questionModal.addChoice")}
                    </button>
                  )}
                </div>
              )}

              {formData.type === "essay" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold font-heading flex items-center gap-2 text-foreground/80">
                    <HelpCircle className="w-4 h-4 text-primary/60" /> {t("wizard.questionModal.sampleAnswer")}
                  </label>
                  <textarea 
                    rows="3" 
                    value={formData.sampleAnswer} 
                    onChange={(e) => setFormData({...formData, sampleAnswer: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none font-sans"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold font-heading text-foreground/80">{t("wizard.questionModal.explanation")}</label>
                <textarea 
                  rows="2" 
                  value={formData.explanation} 
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none font-sans"
                />
              </div>

              {/* Hide Save to Bank if already in bank */}
              {!isBankOnly && (
                <div className="pt-4 border-t border-border/50 space-y-4">
                <div 
                  onClick={() => setSaveToBankState(!saveToBankState)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                    saveToBankState ? "bg-primary/5 border-primary shadow-sm" : "bg-muted/30 border-transparent hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      saveToBankState ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground">{t("wizard.questionModal.saveToBank")}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{t("wizard.questionModal.saveToBankDesc")}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    saveToBankState ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                  )}>
                    {saveToBankState && <Plus className="w-4 h-4" />}
                  </div>
                </div>

                <AnimatePresence>
                  {saveToBankState && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 px-1"
                    >
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t("wizard.questionModal.topicLabel")}</label>
                          <div className="relative group">
                            <input 
                              type="text"
                              value={formData.topic}
                              onChange={(e) => setFormData({...formData, topic: e.target.value})}
                              placeholder="Ví dụ: Đạo hàm, Lịch sử Đảng,..."
                              className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none font-bold text-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className="relative">
                            <div 
                              onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-primary"
                            >
                              <ChevronDown className={cn("w-4 h-4 transition-transform", showTopicDropdown && "rotate-180")} />
                            </div>
                            <AnimatePresence>
                              {showTopicDropdown && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-2 max-h-48 overflow-y-auto"
                                >
                                  {bankTopics.length > 0 ? bankTopics.map(t => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                        setFormData({...formData, topic: t});
                                        setShowTopicDropdown(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                      {t}
                                    </button>
                                  )) : (
                                    <div className="px-3 py-2 text-[10px] text-muted-foreground italic font-medium">
                                      {t("bank.no_topics") || "Chưa có chủ đề"}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSuggestTopic}
                          disabled={suggestingTopic}
                          className="h-[46px] px-4 bg-secondary text-secondary-foreground rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/80 transition-all text-xs disabled:opacity-50"
                        >
                          {suggestingTopic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {t("wizard.questionModal.aiSuggest")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              )}
            </form>

            <div className="p-6 border-t border-border flex gap-3 bg-muted/20">
              <button onClick={handleClose} type="button" className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl font-bold transition-all">
                {t("wizard.questionModal.cancel")}
              </button>
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {question ? t("wizard.questionModal.save") : t("wizard.questionModal.add")}
              </button>
            </div>
          </motion.div>

          <ConfirmationModal 
            isOpen={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            onConfirm={confirmDiscard}
            title={t("common.confirm_discard") || "Hủy thay đổi?"}
            message={t("common.confirm_discard_msg") || "Bạn có những thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?"}
            confirmText={t("common.discard") || "Hủy thay đổi"}
            type="danger"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
