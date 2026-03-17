import { useState, useEffect } from "react";
import { X, Save, Layout, Type, HelpCircle, BarChart3, ListChecks, Plus, Loader2 } from "lucide-react";
import { addQuestion, updateQuestion } from "../../api/examApi";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionModal({ isOpen, onClose, examId, question = null, onSuccess, isAiPreview = false }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
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
  }, [question, isOpen]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAiPreview) {
      onSuccess(formData);
      onClose();
      return;
    }
    setLoading(true);
    try {
      if (question?.id) {
        await updateQuestion(examId, question.id, formData);
      } else {
        await addQuestion(examId, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || t("wizard.questionModal.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold font-heading">
                {question ? t("wizard.questionModal.editTitle") : t("wizard.questionModal.addTitle")}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Layout className="w-4 h-4" /> {t("wizard.questionModal.type")}
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
                    className="w-full bg-muted/50 border border-border rounded-xl p-2.5 focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    <option value="multiple_choice">{t("wizard.step5.types.mc")}</option>
                    <option value="multiple_answer">{t("wizard.step5.types.ma")}</option>
                    <option value="essay">{t("wizard.step5.types.essay")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> {t("wizard.questionModal.difficulty")}
                  </label>
                  <select 
                    value={formData.difficulty} 
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-xl p-2.5 focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    <option value="easy">{t("wizard.step3.difficultyLevels.easy")}</option>
                    <option value="medium">{t("wizard.step3.difficultyLevels.medium")}</option>
                    <option value="hard">{t("wizard.step3.difficultyLevels.hard")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Type className="w-4 h-4" /> {t("wizard.questionModal.content")}
                </label>
                <textarea 
                  required 
                  rows="3" 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder={t("wizard.questionModal.placeholderQuestion")}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                />
              </div>

              {formData.type !== "essay" && (
                <div className="space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> {t("wizard.questionModal.choices")}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {formData.choices.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => toggleAnswer(c.key)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all border-2 flex-shrink-0 ${formData.correctAnswers.includes(c.key) ? "bg-green-500 border-green-500 text-white" : "bg-muted border-border text-muted-foreground hover:border-primary/50"}`}
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
                          }}
                          placeholder={`${t("wizard.questionModal.placeholderChoice")} ${c.key}...`}
                          className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                        {formData.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newChoices = formData.choices.filter((_, idx) => idx !== i);
                              // Re-assign keys to maintain order A, B, C...
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
                  <label className="text-sm font-bold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> {t("wizard.questionModal.sampleAnswer")}
                  </label>
                  <textarea 
                    rows="3" 
                    value={formData.sampleAnswer} 
                    onChange={(e) => setFormData({...formData, sampleAnswer: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold">{t("wizard.questionModal.explanation")}</label>
                <textarea 
                  rows="2" 
                  value={formData.explanation} 
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                />
              </div>
            </form>

            <div className="p-6 border-t border-border flex gap-3 bg-muted/20">
              <button onClick={onClose} type="button" className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl font-bold transition-all">
                {t("wizard.questionModal.cancel")}
              </button>
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {question ? t("wizard.questionModal.save") : t("wizard.questionModal.add")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
