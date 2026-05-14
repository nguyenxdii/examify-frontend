import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  BookOpen, Search, Filter, Trash2, 
  ChevronLeft, ChevronRight, Eye, ChevronDown,
  Calendar, ShieldAlert, X, FileText, CheckCircle,
  Loader2, ArrowUp, Layout, RefreshCw
} from "lucide-react";
import { getExams, deleteExam, getExamDetail } from "../../../api/adminApi";
import { toast } from "react-hot-toast";
import { cn } from "../../../lib/utils";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import Pagination from "../../../components/dashboard/Pagination";
import { motion, AnimatePresence } from "framer-motion";

export default function AllExams() {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [examDetail, setExamDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    document.title = t("titles.admin_exams");
  }, [t]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await getExams();
      setExams(res.data);
    } catch (err) {
      toast.error(t("dashboard.admin.users.fetch_error") || "Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = async (exam) => {
    try {
      setLoadingDetail(true);
      setSelectedExam(exam);
      setShowDetailModal(true);
      const res = await getExamDetail(exam.id);
      setExamDetail(res.data);
    } catch (err) {
      toast.error(t("dashboard.admin.users.detail_error") || "Không thể tải chi tiết đề thi");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteClickInModal = () => {
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const handleInitialDeleteConfirm = () => {
    if (!deleteReason.trim()) {
      toast.error(t("dashboard.admin.exams.delete_reason_required") || "Vui lòng nhập lý do xóa");
      return;
    }
    setShowDeleteModal(false);
    setShowFinalDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      toast.error(t("dashboard.admin.exams.delete_reason_required") || "Vui lòng nhập lý do xóa");
      return;
    }
    try {
      setIsDeleting(true);
      await deleteExam(selectedExam.id, deleteReason);
      toast.success(t("dashboard.admin.exams.delete_success") || "Đã xóa đề thi và thông báo cho giáo viên");
      fetchExams();
      setShowFinalDeleteConfirm(false);
      setShowDetailModal(false);
    } catch (err) {
      toast.error(t("common.error") || "Lỗi khi xóa đề thi");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusMap = {
    all: t("dashboard.admin.exams.status.all") || "Tất cả trạng thái",
    draft: t("exam.detail.status.draft") || "Bản thảo",
    ready: t("exam.detail.status.ready") || "Sẵn sàng",
    shared: t("exam.detail.status.shared") || "Đã chia sẻ"
  };

  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || e.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [exams, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const formatFullDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
    <div className="space-y-8 mb-8">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {t("dashboard.sidebar.allQuizzes") || "Tất cả đề thi"}
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              {t("dashboard.admin.exams.subtitle") || "Quản lý và giám sát toàn bộ tài nguyên đề thi trên hệ thống Examify."}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5 tracking-widest">{t("dashboard.stats.totalQuizzes")}</p>
                <p className="text-xl font-black text-primary">{exams.length}</p>
             </div>
             <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5 tracking-widest">{t("dashboard.admin.exams.status.shared")}</p>
                <p className="text-xl font-black text-emerald-500">{exams.filter(e => e.status?.toLowerCase() === 'shared').length}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1 w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t("dashboard.admin.exams.search_placeholder") || "Tìm tên đề, giáo viên..."}
            className="w-full pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm group-hover:border-primary/40 placeholder:text-muted-foreground/60"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-6 py-3 bg-card border border-border rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none pr-12 shadow-sm hover:border-primary/40"
            >
              {Object.entries(statusMap).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <button 
            onClick={() => fetchExams()}
            className="p-3.5 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-all text-muted-foreground hover:text-primary shadow-sm active:scale-95 group"
            title={t("common.refresh")}
          >
            <RefreshCw className={cn("w-4 h-4 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
          </button>
        </div>
      </div>
    </div>

    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {t("exam.detail.examName") || "Tên đề thi"}
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {t("dashboard.admin.users.table.teacher") || "Giáo viên"}
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">
                  {t("common.questions") || "Số câu"}
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {t("dashboard.admin.users.table.status") || "Trạng thái"}
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {t("dashboard.admin.exams.table.created_at") || "Ngày tạo"}
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap text-right">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-muted rounded-full w-full" /></td>
                  </tr>
                ))
              ) : paginatedExams.length > 0 ? (
                <AnimatePresence mode="popLayout" initial={false}>
                  {paginatedExams.map((exam) => (
                    <motion.tr 
                      key={exam.id} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onClick={() => handleExamClick(exam)}
                      className="hover:bg-muted/10 transition-colors group cursor-pointer"
                    >
                    <td className="px-6 py-5 max-w-[250px] min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate block" title={exam.title}>
                            {exam.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 font-black shrink-0">#{exam.id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate max-w-[150px]">{exam.teacherName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">{exam.teacherEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-foreground">{exam.questionCount}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap",
                        exam.status?.toLowerCase() === "shared" ? "bg-emerald-500/10 text-emerald-600" : 
                        exam.status?.toLowerCase() === "ready" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                      )}>
                        {statusMap[exam.status?.toLowerCase()] || exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                        <div className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <ShieldAlert className="w-12 h-12 mb-4" />
                      <p className="font-bold">{t("dashboard.admin.exams.no_exams") || "Không tìm thấy đề thi nào"}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredExams.length}
          itemsPerPage={itemsPerPage}
          label={t("nav.quizzes") || "đề thi"}
          showFirstLast={true}
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-foreground truncate block" title={selectedExam?.title}>{selectedExam?.title}</h2>
                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 truncate">
                        ID: <span className="font-black text-foreground">#{selectedExam?.id}</span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        {t("dashboard.admin.users.table.teacher") || "Giáo viên"}: <span className="font-black text-foreground">{selectedExam?.teacherName}</span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                          selectedExam?.status?.toLowerCase() === "shared" ? "bg-emerald-500/10 text-emerald-600" : 
                          selectedExam?.status?.toLowerCase() === "ready" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                        )}>
                          {statusMap[selectedExam?.status?.toLowerCase()] || selectedExam?.status}
                        </span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-muted rounded-xl transition-all shrink-0">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {loadingDetail ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-sm font-bold text-muted-foreground">{t("common.loading")}</p>
                   </div>
                ) : examDetail && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("exam.detail.subject") || "Môn học"}</p>
                            <p className="font-bold text-sm truncate" title={examDetail.subject}>{examDetail.subject || "N/A"}</p>
                        </div>
                        <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("exam.detail.duration") || "Thời gian"}</p>
                            <p className="font-bold text-sm">{examDetail.duration} {t("common.minutes")}</p>
                        </div>
                        <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("dashboard.admin.exams.table.created_at")}</p>
                            <p className="font-bold text-[10px]">{formatFullDate(examDetail.createdAt)}</p>
                        </div>
                        <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{t("common.updated_at") || "Cập nhật"}</p>
                            <p className="font-bold text-[10px]">{formatFullDate(examDetail.updatedAt)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            {t("common.questions_list") || "Danh sách Câu hỏi"} ({examDetail.questions?.length || 0})
                        </h3>
                        <div className="space-y-6">
                            {examDetail.questions?.map((q, idx) => (
                                <div key={idx} className="p-6 bg-card border border-border rounded-2xl space-y-4 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-black text-primary px-3 py-1 bg-primary/5 rounded-full uppercase tracking-widest">{t("exam.detail.question_num", { num: idx + 1 }) || `Câu ${idx + 1}`}</span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted/30 px-2 py-0.5 rounded-md">
                                          {q.type === 'essay' ? (t("exam.detail.type.essay") || "Tự luận") : (t("exam.detail.type.multiple_choice") || "Trắc nghiệm")}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-foreground leading-relaxed">{q.content}</p>
                                    
                                    {q.type === 'multiple_choice' && q.choices && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {q.choices.map((choice, cIdx) => {
                                                const isCorrect = q.correctAnswers?.includes(choice.content);
                                                return (
                                                    <div key={cIdx} className={cn(
                                                        "p-3 rounded-xl text-xs border flex items-center gap-3 transition-all",
                                                        isCorrect 
                                                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 font-bold" 
                                                          : "bg-muted/30 border-border/50 text-muted-foreground"
                                                    )}>
                                                        <span className={cn(
                                                          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-black",
                                                          isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                                        )}>
                                                          {choice.key || String.fromCharCode(65 + cIdx)}
                                                        </span>
                                                        <span className="flex-1">{choice.content}</span>
                                                        {isCorrect && <CheckCircle className="w-4 h-4 shrink-0 opacity-60" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {q.explanation && (
                                        <div className="mt-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                            <p className="text-[10px] font-black uppercase text-blue-500 mb-1">{t("exam.detail.explanation") || "Giải thích"}</p>
                                            <p className="text-xs text-blue-700/80 leading-relaxed italic">"{q.explanation}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-muted/10 flex justify-between gap-4">
                <button 
                  onClick={handleDeleteClickInModal}
                  className="px-8 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("common.delete") || "XÓA ĐỀ THI"}
                </button>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="px-8 py-2.5 bg-card border border-border rounded-xl font-bold text-sm hover:bg-muted transition-all"
                >
                  {t("common.ok") || "ĐÓNG"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleInitialDeleteConfirm}
        title={t("dashboard.admin.exams.delete_modal.title") || "Xóa đề thi vi phạm"}
        message={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("dashboard.admin.exams.delete_modal.warning") || "Bạn chuẩn bị xóa đề thi"} <span className="font-black text-foreground">"{selectedExam?.title}"</span>. 
              {t("dashboard.admin.exams.delete_modal.impact") || "Hành động này sẽ xóa vĩnh viễn và thông báo cho giáo viên."}
            </p>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("dashboard.admin.exams.delete_modal.reason_label") || "Lý do xóa:"}</label>
              <textarea 
                className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-destructive/20 outline-none min-h-[100px]"
                placeholder={t("dashboard.admin.exams.delete_modal.reason_placeholder") || "VD: Vi phạm bản quyền, nội dung nhạy cảm..."}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
          </div>
        }
        confirmText={t("common.next")}
        type="danger"
      />

      <ConfirmationModal 
        isOpen={showFinalDeleteConfirm}
        onClose={() => setShowFinalDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={t("common.confirm") || "Xác nhận cuối cùng"}
        message={
          <div className="text-center space-y-4">
             <p className="text-sm font-bold text-foreground">
                Bạn có chắc chắn muốn xóa vĩnh viễn đề thi này không?
             </p>
             <p className="text-xs text-muted-foreground italic">
                Lưu ý: Thao tác này không thể hoàn tác.
             </p>
          </div>
        }
        confirmText={t("common.delete")}
        type="danger"
        loading={isDeleting}
      />

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
    </motion.div>
  );
}
