import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Database, Search, Filter, Plus, MoreVertical, 
  BookOpen, Hash, BarChart3, Trash2, Edit2, 
  ChevronRight, LayoutGrid, List, Sparkles,
  CheckCircle2, FolderRoot, FilterX, Loader2, ChevronDown, ChevronLeft
} from "lucide-react";
import { getQuestionBank, saveToBank } from "../../../api/examApi";
import QuestionModal from "../../../components/dashboard/QuestionModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { toast } from "react-hot-toast";

export default function QuestionBank() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [topics, setTopics] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getQuestionBank();
      setQuestions(res.data || []);
      
      // Extract unique topics
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
    
    if (searchTerm) {
      result = result.filter(q => 
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredQuestions(result);
    setCurrentPage(1); // Reset to page 1 on search/filter
  }, [searchTerm, selectedTopic, questions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-bold animate-pulse">Đang mở kho lưu trữ...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading uppercase tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Database className="w-6 h-6" />
            </div>
            {t("dashboard.sidebar.questions")}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">{t("bank.subtitle") || "Quản lý và tái sử dụng kho câu hỏi trí tuệ của bạn"}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedQuestion(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#8B5CF6] text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" /> {t("bank.create_single") || "Tạo câu hỏi lẻ"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card border border-border p-5 rounded-[2.5rem] shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder={t("bank.search_placeholder") || "Tìm kiếm nội dung câu hỏi..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/30 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Topic Dropdown */}
          <div className="relative group/topic w-full md:w-48">
            <div className="flex items-center justify-between bg-muted/50 px-5 py-4 rounded-2xl cursor-pointer hover:bg-muted transition-all border border-transparent hover:border-border">
              <div className="flex items-center gap-2 truncate">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-black truncate">
                  {selectedTopic === "all" ? t("bank.all_topics") || "Tất cả chủ đề" : selectedTopic}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-hover/topic:rotate-180" />
            </div>
            
            <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/topic:opacity-100 group-hover/topic:visible transition-all z-50 p-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedTopic("all")}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-colors flex items-center justify-between",
                  selectedTopic === "all" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                )}
              >
                {t("bank.all") || "Tất cả"}
                <span className="opacity-60">{questions.length}</span>
              </button>
              <div className="my-1 h-px bg-border/50" />
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-colors flex items-center justify-between truncate",
                    selectedTopic === t ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span className="truncate mr-2">{t}</span>
                  <span className="opacity-60">{questions.filter(q => q.topic === t).length}</span>
                </button>
              ))}
            </div>
          </div>

          </div>
        </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-6 transition-all">
          {currentItems.map((q, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={q.id || i}
              className="group bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/40 hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/5 group-hover:bg-primary/20 transition-colors" />
              
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
                      {q.type === 'multiple_choice' ? t("wizard.step5.types.mc") : q.type === 'multiple_answer' ? t("wizard.step5.types.ma") : t("wizard.step5.types.essay")}
                    </span>
                    <span className={cn(
                      "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border",
                      q.difficulty === 'easy' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" :
                      q.difficulty === 'hard' ? "bg-rose-500/10 text-rose-600 border-rose-500/10" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/10"
                    )}>
                      {q.difficulty === 'easy' ? t("wizard.step3.difficultyLevels.easy") : q.difficulty === 'hard' ? t("wizard.step3.difficultyLevels.hard") : t("wizard.step3.difficultyLevels.medium")}
                    </span>
                    {q.topic && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-[9px] font-black uppercase tracking-widest rounded-lg border border-border/50">
                        {q.topic}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-muted rounded-xl transition-all"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>

                <h3 className="text-xl font-bold leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
                  {q.content}
                </h3>

                {q.type !== 'essay' && q.choices && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.choices.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-transparent group-hover:border-border/50 transition-all">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs",
                          q.correctAnswers?.includes(c.key) ? "bg-emerald-500 text-white" : "bg-white border border-border text-muted-foreground"
                        )}>
                          {c.key}
                        </div>
                        <span className="text-xs font-medium truncate">{c.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="col-span-full py-20 bg-muted/10 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <FilterX className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black">{t("bank.empty_title") || "Không tìm thấy câu hỏi"}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {t("bank.empty_desc") || "Không có câu hỏi nào khớp với tìm kiếm hoặc chủ đề hiện tại. Thử đổi bộ lọc nhé!"}
                </p>
              </div>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedTopic("all"); }}
                className="px-8 py-3 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {t("bank.clear_filters") || "Xóa tất cả bộ lọc"}
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-3 rounded-xl bg-card border border-border disabled:opacity-50 hover:bg-muted transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-10 h-10 rounded-xl font-black text-xs transition-all",
                    currentPage === i + 1 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-card border border-border hover:bg-muted"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-3 rounded-xl bg-card border border-border disabled:opacity-50 hover:bg-muted transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 bg-card border border-border rounded-xl disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={cn(
                "w-12 h-12 rounded-xl font-black text-sm transition-all",
                currentPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card border border-border hover:bg-muted"
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 bg-card border border-border rounded-xl disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        examId="bank"
        question={selectedQuestion}
        onSuccess={fetchData}
        isBankOnly={true}
      />
    </div>
  );
}
