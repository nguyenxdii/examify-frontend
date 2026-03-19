import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  Calendar,
  FileQuestion,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Pencil,
  Clock,
  ChevronLeft,
  ArrowRight,
  MoreVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyExams, deleteExam } from "../../../api/examApi";
import CreateExamModal from "../../../components/dashboard/CreateExamModal";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function MyExams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  
  // New States
  const [activeTab, setActiveTab] = useState('all'); // all, published, drafts
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const itemsPerPage = 10;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    examId: null,
    title: "",
    message: ""
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await getMyExams();
      setExams(res.data);
    } catch (err) {
      toast.error(t("wizard.list.fetchError") || "Lỗi khi tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDeleteClick = (e, exam) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      examId: exam.id,
      title: t("wizard.list.deleteTitle") || "Xác nhận xóa",
      message: t("wizard.list.deleteConfirm", { title: exam.title }) || `Bạn có chắc chắn muốn xóa đề thi "${exam.title}"?`
    });
  };

  const performDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteExam(confirmModal.examId);
      toast.success(t("wizard.list.deleteSuccess") || "Đã xóa đề thi thành công");
      setConfirmModal({ isOpen: false, examId: null, title: "", message: "" });
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || t("wizard.list.deleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (e, exam) => {
    e.stopPropagation();
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredExams = exams.filter((exam) => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'published' && (exam.status === 'shared' || exam.status === 'ready')) || 
      (activeTab === 'drafts' && exam.status === 'draft');
    
    const matchesSearch = 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.subject && exam.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesTab && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
            {t("wizard.detail.status.draft")}
          </span>
        );
      case "ready":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
            {t("wizard.detail.status.ready")}
          </span>
        );
      case "shared":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            {t("wizard.detail.status.shared")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("dashboard.sidebar.myQuizzes")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("wizard.list.desc")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/teacher/create-quiz")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-primary/25 hover:-translate-y-1 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            {t("dashboard.sidebar.createQuiz")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">
            {t("wizard.detail.status.loading") || t("wizard.step6.saving.exam")}
          </p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
          <h2 className="text-2xl font-black mb-3 font-heading">
            {t("wizard.list.empty")}
          </h2>
          <p className="text-muted-foreground max-w-md text-lg mb-8">
            {t("wizard.list.emptyDesc")}
          </p>
          <button
            onClick={() => navigate("/dashboard/teacher/create-quiz")}
            className="px-10 py-3.5 bg-primary text-primary-foreground rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            {t("dashboard.sidebar.createQuiz")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs & Search */}
          <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm overflow-hidden bg-card/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl w-fit">
                {[
                  { id: 'all', label: t("dashboard.recentQuizzes.viewAll") },
                  { id: 'published', label: t("wizard.detail.status.ready") },
                  { id: 'drafts', label: t("wizard.detail.status.draft") }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("dashboard.header.search") || "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quiz List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedExams.length > 0 ? (
                paginatedExams.map((exam, idx) => (
                  <motion.div
                    key={exam.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => navigate(`/dashboard/teacher/my-quizzes/${exam.id}`)}
                    className="group bg-card border border-border rounded-[2rem] p-6 hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileQuestion className="w-7 h-7 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {exam.title}
                          </h3>
                          {getStatusBadge(exam.status)}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1 mb-4">
                          {exam.description || t("wizard.list.noDescription")}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary/60" />
                            <span>{exam.subject || t("wizard.list.unclassified")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span>
                              {t("wizard.detail.questionsCount", { count: exam.questionCount || 0 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-0 md:ml-6 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-border md:w-auto w-full justify-between">
                      <div className="flex items-center gap-1 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                        {t("wizard.list.details")}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2 relative">
                        <button
                          onClick={(e) => toggleMenu(e, exam.id)}
                          className={`p-2.5 rounded-xl transition-all border border-transparent shadow-sm hover:shadow-md ${
                            activeMenuId === exam.id 
                              ? 'bg-primary text-white shadow-primary/20' 
                              : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                          }`}
                          title={t("common.actions") || "Thao tác"}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenuId === exam.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                              <div className="p-1.5 flex flex-col">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleEditClick(e, exam); }}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted rounded-xl transition-all text-sm font-bold text-muted-foreground hover:text-primary group"
                                >
                                  <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  {t("common.edit") || "Chỉnh sửa"}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleDeleteClick(e, exam); }}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold text-red-500 group"
                                >
                                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  {t("common.delete") || "Xóa đề thi"}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-card border border-border rounded-[2rem] py-20 text-center shadow-sm">
                  <p className="text-muted-foreground font-medium">Không tìm thấy đề thi nào phù hợp.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border bg-card/50 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Đang hiển thị <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, filteredExams.length)}</span> trong <span className="font-bold text-foreground">{filteredExams.length}</span> đề thi
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        currentPage === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateExamModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingExam(null); }}
        editingExam={editingExam}
        onSuccess={fetchExams}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={performDelete}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
