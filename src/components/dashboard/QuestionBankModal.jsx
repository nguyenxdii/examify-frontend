import { useState, useEffect } from "react";
import { X, Search, Database, Plus, Check, Loader2, BookOpen, Tag } from "lucide-react";
import { getQuestionBank, addQuestion } from "../../api/examApi";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function QuestionBankModal({ isOpen, onClose, examId, existingQuestions = [], onSuccess }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    subject: "all",
    difficulty: "all"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getQuestionBank();
      setQuestions(res.data || []);
      setFilteredQuestions(res.data || []);
    } catch (err) {
      toast.error(t("bank.fetch_error") || "Không thể tải ngân hàng câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSelectedIds([]);
    }
  }, [isOpen]);

  useEffect(() => {
    let result = questions;

    if (search) {
      result = result.filter(q => 
        q.content.toLowerCase().includes(search.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (filters.subject !== "all") {
      result = result.filter(q => q.subject === filters.subject);
    }

    if (filters.difficulty !== "all") {
      result = result.filter(q => q.difficulty === filters.difficulty);
    }

    setFilteredQuestions(result);
  }, [search, filters, questions]);

  const subjects = ["all", ...new Set(questions.map(q => q.subject).filter(Boolean))];

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      // Duplicate Check
      const targetQuestion = questions.find(q => q.id === id);
      const isDuplicate = existingQuestions.some(eq => eq.content === targetQuestion.content);
      
      if (isDuplicate) {
        toast.error(t("bank.duplicate_error") || "Câu hỏi này đã tồn tại trong đề thi!");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;
    
    setSubmitting(true);
    try {
      const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));
      
      for (const q of selectedQuestions) {
        const { id, createdAt, updatedAt, examId: oldExamId, ...payload } = q;
        await addQuestion(examId, payload);
      }
      
      toast.success(t("bank.add_success", { count: selectedIds.length }) || `Đã thêm ${selectedIds.length} câu hỏi vào đề thi`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(t("bank.add_error") || "Lỗi khi thêm câu hỏi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }} 
            className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading">{t("bank.modal_title") || "Ngân hàng câu hỏi"}</h3>
                  <p className="text-xs text-muted-foreground">{t("bank.modal_subtitle") || "Chọn câu hỏi từ kho lưu trữ của bạn"}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 border-b border-border bg-card flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder={t("bank.modal_search_placeholder") || "Tìm kiếm nội dung hoặc chủ đề..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={filters.subject}
                  onChange={(e) => setFilters({...filters, subject: e.target.value})}
                  className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary font-bold"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s === 'all' ? t("bank.all_subjects") || "Tất cả môn" : s}</option>
                  ))}
                </select>
                <select 
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                  className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary font-bold"
                >
                  <option value="all">{t("bank.all_difficulties") || "Tất cả độ khó"}</option>
                  <option value="easy">{t("wizard.step3.difficultyLevels.easy")}</option>
                  <option value="medium">{t("wizard.step3.difficultyLevels.medium")}</option>
                  <option value="hard">{t("wizard.step3.difficultyLevels.hard")}</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-bold italic">{t("bank.loading") || "Đang truy cập kho lưu trữ..."}</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-20">
                  <Database className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">{t("bank.empty_search") || "Không tìm thấy câu hỏi nào phù hợp"}</p>
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div 
                    key={q.id}
                    onClick={() => handleToggleSelect(q.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                      selectedIds.includes(q.id) 
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" 
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedIds.includes(q.id) ? "bg-primary border-primary text-white" : "border-border group-hover:border-primary/50"
                      }`}>
                        {selectedIds.includes(q.id) && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" /> {q.subject || t("bank.unclassified") || "Chưa phân loại"}
                          </span>
                          {q.topic && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <Tag className="w-3 h-3" /> {q.topic}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : 
                            q.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {q.difficulty === 'easy' ? t("wizard.step3.difficultyLevels.easy") : q.difficulty === 'hard' ? t("wizard.step3.difficultyLevels.hard") : t("wizard.step3.difficultyLevels.medium")}
                          </span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">{q.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-border flex items-center justify-between bg-muted/20">
              <p className="text-sm text-muted-foreground font-bold">
                {t("bank.selected_count", { count: selectedIds.length }) || `Đã chọn ${selectedIds.length} câu hỏi`}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-bold text-sm transition-all"
                >
                  {t("common.cancel") || "Hủy"}
                </button>
                <button 
                  onClick={handleAddSelected}
                  disabled={selectedIds.length === 0 || submitting}
                  className="px-8 py-2.5 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t("bank.add_to_exam") || "Thêm vào đề thi"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
