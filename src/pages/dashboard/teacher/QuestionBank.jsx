import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Database, Search, Filter, Plus, MoreVertical, 
  BookOpen, Hash, BarChart3, Trash2, Edit2, 
  ChevronRight, LayoutGrid, List, Sparkles,
  CheckCircle2, FolderRoot, FilterX, Loader2, ChevronDown, ChevronLeft,
  Calendar, Layers, Tag, ArrowUp, Info
} from "lucide-react";
import { getQuestionBank, deleteBankQuestion } from "../../../api/examApi";
import QuestionModal from "../../../components/dashboard/QuestionModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import Pagination from "../../../components/dashboard/Pagination";
import MarkdownRenderer from "../../../components/MarkdownRenderer";

export default function QuestionBank() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [topics, setTopics] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    document.title = t("titles.question_bank");
  }, [t]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getQuestionBank();
      setQuestions(res.data || []);
      
      const uniqueTopics = [...new Set(res.data.map(q => q.topic).filter(Boolean))];
      setTopics(uniqueTopics);
      
      setFilteredQuestions(res.data || []);
    } catch (err) {
      toast.error(t("bank.fetch_error") || "Không thể tải ngân hàng câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = questions;
    
    if (selectedTopic !== "all") {
      result = result.filter(q => q.topic === selectedTopic);
    }
    
    if (typeFilter !== "all") {
      result = result.filter(q => q.type === typeFilter);
    }
    
    if (difficultyFilter !== "all") {
      result = result.filter(q => q.difficulty === difficultyFilter);
    }

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(q => 
        (q.content && q.content.toLowerCase().includes(lowSearch)) ||
        (q.topic && q.topic.toLowerCase().includes(lowSearch))
      );
    }
    
    setFilteredQuestions(result);
    setCurrentPage(1);
    setExpandedId(null);
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchTerm, selectedTopic, typeFilter, difficultyFilter, questions]);

  useEffect(() => {
    setExpandedId(null);
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async () => {
    try {
      await deleteBankQuestion(deleteId);
      toast.success(t("common.delete_success") || "Đã xóa câu hỏi");
      fetchData();
    } catch (err) {
      toast.error(t("common.error_delete") || "Lỗi khi xóa câu hỏi");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
      </div>
      <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest text-xs">{t("common.loading")}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t("dashboard.sidebar.questions")}
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg">{t("bank.subtitle") || "Quản lý và tái sử dụng kho câu hỏi trí tuệ của bạn một cách thông minh."}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedQuestion(null);
            setIsModalOpen(true);
          }}
          className="group flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] transition-all shadow-xl shadow-primary/20 w-full md:w-auto relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform" /> 
          <span className="relative z-10">{t("bank.create_single") || "Tạo câu hỏi lẻ"}</span>
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card border border-border p-4 rounded-3xl shadow-sm">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder={t("bank.search_placeholder") || "Tìm kiếm nội dung, chủ đề..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl pl-14 pr-6 py-4 text-sm font-medium transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Topic Dropdown */}
            <div className="relative group/topic w-full md:w-60">
              <div className="flex items-center justify-between bg-muted/30 px-6 py-4 rounded-[1.75rem] cursor-pointer hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 truncate">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-black truncate">
                    {selectedTopic === "all" ? t("bank.all_topics") || "Tất cả chủ đề" : selectedTopic}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-hover/topic:rotate-180" />
              </div>
              
              <div className="absolute top-full left-0 right-0 mt-3 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl opacity-0 invisible group-hover/topic:opacity-100 group-hover/topic:visible transition-all z-50 p-2 max-h-80 overflow-y-auto">
                <button
                  onClick={() => setSelectedTopic("all")}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between mb-1",
                    selectedTopic === "all" ? "bg-primary text-white" : "hover:bg-primary/10 text-muted-foreground"
                  )}
                >
                  {t("bank.all_topics")}
                  <span className={cn("px-2 py-0.5 rounded-lg text-[10px]", selectedTopic === "all" ? "bg-white/20" : "bg-muted")}>{questions.length}</span>
                </button>
                <div className="my-2 h-px bg-border/50 mx-2" />
                {topics.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between truncate mb-1",
                      selectedTopic === t ? "bg-primary text-white" : "hover:bg-primary/10 text-muted-foreground"
                    )}
                  >
                    <span className="truncate mr-2">{t}</span>
                    <span className={cn("px-2 py-0.5 rounded-lg text-[10px]", selectedTopic === t ? "bg-white/20" : "bg-muted")}>
                      {questions.filter(q => q.topic === t).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group/diff w-full md:w-60">
              <div className="flex items-center justify-between bg-muted/30 px-6 py-4 rounded-[1.75rem] cursor-pointer hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 truncate">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-black truncate">
                    {difficultyFilter === "all" ? t("wizard.step3.difficulty") || "Độ khó" : 
                     difficultyFilter === "easy" ? t("wizard.step3.difficultyLevels.easy") :
                     difficultyFilter === "medium" ? t("wizard.step3.difficultyLevels.medium") :
                     t("wizard.step3.difficultyLevels.hard")}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-hover/diff:rotate-180" />
              </div>
              
              <div className="absolute top-full left-0 right-0 mt-3 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl opacity-0 invisible group-hover/diff:opacity-100 group-hover/diff:visible transition-all z-50 p-2 overflow-hidden">
                {["all", "easy", "medium", "hard"].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between mb-1",
                      difficultyFilter === diff ? "bg-primary text-white" : "hover:bg-primary/10 text-muted-foreground"
                    )}
                  >
                    {diff === "all" ? t("common.all") : 
                     diff === "easy" ? t("wizard.step3.difficultyLevels.easy") :
                     diff === "medium" ? t("wizard.step3.difficultyLevels.medium") :
                     t("wizard.step3.difficultyLevels.hard")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4 px-2">
          {[
            { id: "all", label: t("common.all") || "Tất cả" },
            { id: "multiple_choice", label: t("wizard.step5.types.mc") || "Trắc nghiệm" },
            { id: "multiple_answer", label: t("wizard.step5.types.ma") || "Nhiều đáp án" },
            { id: "essay", label: t("wizard.step5.types.essay") || "Tự luận" }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all border",
                typeFilter === type.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4">
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              layout
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {currentItems.map((q, i) => (
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  key={q.id}
                  className={cn(
                    "group bg-card border border-border rounded-2xl p-5 hover:bg-muted/20 hover:border-primary/20 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-4",
                    expandedId === q.id && "ring-2 ring-primary border-transparent shadow-md"
                  )}
                >
                  <div className="flex-1 space-y-3 z-10" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                          {q.type === 'multiple_choice' ? t("wizard.step5.types.mc") : q.type === 'multiple_answer' ? t("wizard.step5.types.ma") : t("wizard.step5.types.essay")}
                        </span>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                          q.difficulty === 'easy' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                          q.difficulty === 'hard' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                          "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        )}>
                          {q.difficulty === 'easy' ? t("wizard.step3.difficultyLevels.easy") : q.difficulty === 'hard' ? t("wizard.step3.difficultyLevels.hard") : t("wizard.step3.difficultyLevels.medium")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <MarkdownRenderer content={q.content} className="text-base font-bold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors pr-10" />

                    {q.topic && (
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 w-fit px-3 py-1 rounded-xl border border-border/50">
                        <Tag className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate max-w-[250px]">{q.topic}</span>
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {expandedId === q.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden w-full border-t border-border mt-4 pt-4"
                        >
                          <div className="space-y-6">
                             <MarkdownRenderer content={q?.content} className="text-lg font-bold font-heading leading-snug" />
                             {Array.isArray(q?.choices) && q.choices.length > 0 && (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {q.choices.map((c, i) => {
                                   const isCorrect = Array.isArray(q.correctAnswers) && q.correctAnswers.includes(c.key);
                                   return (
                                     <div 
                                       key={i} 
                                       className={cn(
                                         "relative p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
                                         isCorrect 
                                           ? "border-emerald-500 bg-emerald-50/50 shadow-sm" 
                                           : "border-border bg-muted/30"
                                       )}
                                     >
                                       <div className={cn(
                                         "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all flex-shrink-0",
                                         isCorrect ? "bg-emerald-500 text-white" : "bg-background border border-border text-muted-foreground"
                                       )}>
                                         {c.key}
                                       </div>
                                       <MarkdownRenderer content={c.content} className={cn("text-sm leading-relaxed", isCorrect ? "font-bold text-emerald-900" : "text-foreground/80")} />
                                     </div>
                                   );
                                 })}
                               </div>
                             )}
                             {q?.explanation && (
                               <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 items-start">
                                 <Info className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{t("wizard.questionModal.explanation")}</p>
                                   <MarkdownRenderer content={q.explanation} className="text-sm text-muted-foreground italic" />
                                 </div>
                               </div>
                             )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-end md:flex-col md:justify-start">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuestion(q);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(q.id);
                        }}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="py-32 bg-card border-2 border-dashed border-border rounded-[4rem] flex flex-col items-center justify-center text-center space-y-8 px-6">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center relative">
              <FilterX className="w-10 h-10 text-muted-foreground" />
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black font-heading">{t("bank.empty_title") || "Ngân hàng trống"}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                {t("bank.empty_desc") || "Không có câu hỏi nào khớp với tiêu chí tìm kiếm. Hãy thử làm mới bộ lọc nhé!"}
              </p>
            </div>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedTopic("all"); }}
              className="px-10 py-4 bg-foreground text-background font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              {t("bank.clear_filters") || "Xóa tất cả bộ lọc"}
            </button>
          </div>
        )}

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredQuestions.length}
          itemsPerPage={itemsPerPage}
          label={t("dashboard.sidebar.questions") || "câu hỏi"}
          showSummary={false}
          showFirstLast={true}
        />
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => {
          const scrollContainer = document.querySelector('main');
          if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-primary text-white shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
      </button>

      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        examId="bank"
        question={selectedQuestion}
        onSuccess={fetchData}
        isBankOnly={true}
      />

      <ConfirmationModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("common.delete_confirm") || "Xác nhận xóa?"}
        message={t("bank.delete_confirm_msg") || "Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng? Thao tác này không thể hoàn tác."}
        type="danger"
      />
    </div>
  );
}
