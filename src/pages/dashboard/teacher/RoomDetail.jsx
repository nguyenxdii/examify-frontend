import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Users, 
  FileText, 
  Upload, 
  Play, 
  Square, 
  Trash2, 
  CheckCircle2, 
  Search,
  ChevronRight,
  Clock,
  Calendar,
  Layout,
  X,
  Share2,
  Edit2,
  QrCode,
  Sparkles,
  Layers,
  Plus
} from "lucide-react";
import { 
  getRoomDetail, 
  openRoom, 
  closeRoom, 
  deleteRoom, 
  getStudentList, 
  getRoomSubmissions, 
  uploadStudentList,
  addStudentManual,
  updateStudentManual,
  deleteStudentManual,
  publishScores,
  toggleSubmissionGraded,
  previewStudentList
} from "../../../api/roomApi";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "../../../components/dashboard/ShareModal";
import StudentPreviewModal from "../../../components/dashboard/StudentPreviewModal";
import { cn } from "../../../lib/utils";

export default function RoomDetail() {
  const { t, i18n } = useTranslation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [activeTab, setActiveTab] = useState("submissions");
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;
  const [copied, setCopied] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewStudents, setPreviewStudents] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null); // { id, studentId, studentName }
  const [newStudent, setNewStudent] = useState({ studentId: "", studentName: "" });
  const [submissionFilter, setSubmissionFilter] = useState("all"); // all, graded, pending
  const studentListRef = useRef(null);

  const handleTogglePublish = async () => {
    const newStatus = !room.scoresPublished;
    setConfirmModal({
      isOpen: true,
      title: newStatus ? "Công bố điểm" : "Hủy công bố",
      message: newStatus 
        ? "Bạn có muốn công bố tất cả bài đã chấm xong cho học sinh không? Học sinh sẽ có thể tra cứu và xem kết quả."
        : "Bạn có muốn hủy công bố toàn bộ điểm phòng thi này không?",
      type: newStatus ? "success" : "warning",
      onConfirm: performTogglePublish
    });
  };

  const performTogglePublish = async () => {
    try {
      setActionLoading(true);
      const newStatus = !room.scoresPublished;
      await publishScores(roomId, newStatus);
      toast.success(newStatus ? t("common.publish_success") : t("common.unpublish_success"));
      fetchData(true);
    } catch (error) {
      toast.error(t("common.error_update_publish"));
    } finally {
      setActionLoading(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleToggleGraded = async (subId, currentGraded) => {
    try {
      setActionLoading(true);
      await toggleSubmissionGraded(roomId, subId, !currentGraded);
      toast.success(!currentGraded ? t("common.confirm_graded_success") : t("common.unconfirm_graded_success"));
      fetchData(true);
    } catch (error) {
      toast.error(t("common.error_update_graded"));
    } finally {
      setActionLoading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {}
  });

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [roomRes, subRes] = await Promise.all([
        getRoomDetail(roomId),
        getRoomSubmissions(roomId)
      ]);
      setRoom(roomRes.data);
      // Sort submissions by date ascending (oldest first) as requested
      const sortedSubs = [...subRes.data].sort((a, b) => 
        new Date(a.submittedAt) - new Date(b.submittedAt)
      );
      setSubmissions(sortedSubs);
      
      if (roomRes.data.requireStudentList) {
        const studentRes = await getStudentList(roomId);
        setStudents(studentRes.data);
      }
    } catch (error) {
      toast.error(t("rooms.fetch_error"));
      navigate("/dashboard/teacher/rooms");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roomId]);

  useEffect(() => {
    if (room) {
      document.title = t("titles.room_detail", { name: room.name });
    }
  }, [room, t]);

  const handleToggleStatusRequest = () => {
    const isOpening = room.status !== "open";
    setConfirmModal({
      isOpen: true,
      title: isOpening ? t("rooms.toggle_open_title") : t("rooms.toggle_close_title"),
      message: isOpening 
        ? t("rooms.toggle_open_msg", { name: room.name }) 
        : t("rooms.toggle_close_msg", { name: room.name }),
      type: isOpening ? "success" : "warning",
      onConfirm: performToggleStatus
    });
  };

  const performToggleStatus = async () => {
    try {
      setActionLoading(true);
      if (room.status === "open") {
        await closeRoom(roomId);
        toast.success(t("rooms.close_success"));
      } else {
        await openRoom(roomId);
        toast.success(t("rooms.open_success"));
      }
      fetchData(true);
    } catch (error) {
      toast.error(t("rooms.action_error"));
    } finally {
      setActionLoading(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteRequest = () => {
    if (room.status === "open") {
      toast.error(t("rooms.delete_open_error"));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: t("rooms.delete_title"),
      message: t("rooms.delete_msg", { name: room.name }),
      type: "danger",
      onConfirm: performDelete
    });
  };

  const performDelete = async () => {
    try {
      setActionLoading(true);
      await deleteRoom(roomId);
      toast.success(t("rooms.delete_success"));
      navigate("/dashboard/teacher/rooms");
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.delete_error"));
    } finally {
      setActionLoading(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
  };

  const handlePreviewFile = async () => {
    if (!pendingFile) return;
    const formData = new FormData();
    formData.append("file", pendingFile);

    try {
      setUploading(true);
      const res = await previewStudentList(roomId, formData);
      setPreviewStudents(res.data || []);
      setIsPreviewModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.upload_error") || "Lỗi đọc file");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    const formData = new FormData();
    formData.append("file", pendingFile);

    try {
      setActionLoading(true);
      await uploadStudentList(roomId, formData);
      toast.success(t("rooms.detail.upload_success") || "Đã tải danh sách học sinh");
      setIsPreviewModalOpen(false);
      setPendingFile(null);
      fetchData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.upload_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddStudentManual = async (e) => {
    e.preventDefault();
    if (!newStudent.studentId || !newStudent.studentName) {
      toast.error(t("common.fill_all"));
      return;
    }

    try {
      setActionLoading(true);
      if (editingStudent) {
        // Update existing
        await updateStudentManual(roomId, editingStudent.id, newStudent);
        toast.success(t("rooms.detail.update_success") || "Đã cập nhật thông tin học sinh");
      } else {
        // Add new
        await addStudentManual(roomId, newStudent);
        toast.success(t("rooms.detail.add_success") || "Đã thêm học sinh");
      }
      setIsAddStudentModalOpen(false);
      setEditingStudent(null);
      setNewStudent({ studentId: "", studentName: "" });
      fetchData(true);
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.action_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: t("rooms.detail.delete_student"),
      message: t("rooms.detail.delete_student_confirm", { name: studentName }),
      type: "danger",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await deleteStudentManual(roomId, studentId);
          toast.success(t("rooms.detail.delete_success") || "Đã xóa học sinh");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchData(true);
        } catch (error) {
          toast.error(t("rooms.action_error"));
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setNewStudent({ studentId: student.studentId, studentName: student.studentName });
    setIsAddStudentModalOpen(true);
  };

  const scrollToStudentList = () => {
    if (studentListRef.current) {
      studentListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageChange = (page) => {
    setStudentPage(page);
    scrollToStudentList();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      toast.success(t("rooms.copy_success") || "Đã sao chép mã phòng");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t("common.error_copy"));
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const formatCloseTime = (dateStr) => {
    if (!dateStr) return t("common.unlimited");
    return formatDateTime(dateStr);
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = submissionFilter === "all" ||
                          (submissionFilter === "graded" && s.graded) ||
                          (submissionFilter === "pending" && !s.graded);
    return matchesSearch && matchesFilter;
  });

  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * studentsPerPage,
    studentPage * studentsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  if (loading) return (
    <div className="p-20 text-center space-y-4">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground font-medium">{t("common.loading")}</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/dashboard/teacher/rooms")}
            className="group flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-primary hover:text-white border-2 border-primary/20 hover:border-primary rounded-xl transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-white">
              {t("rooms.detail.back") || "Quay lại"}
            </span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTogglePublish}
            disabled={actionLoading}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm",
              room.scoresPublished
              ? "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600"
              : "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {room.scoresPublished ? t('common.unpublished') : t('common.published')}
          </button>
          <button
            onClick={handleToggleStatusRequest}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm ${
              room.status === "open" 
              ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600" 
              : "bg-green-500 text-white shadow-green-500/20 hover:bg-green-600"
            }`}
          >
            {room.status === "open" ? <><Square className="w-3.5 h-3.5 fill-current"/> {t("rooms.detail.close_btn")}</> : <><Play className="w-3.5 h-3.5 fill-current"/> {t("rooms.detail.open_btn")}</>}
          </button>
          <button 
            onClick={handleDeleteRequest}
            className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative group/header">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover/header:bg-primary/10 transition-colors" />
        
        <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-nowrap overflow-hidden">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight font-heading truncate" title={room.name}>{room.name}</h1>
              <div className="flex gap-1.5 shrink-0">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap shadow-sm ${
                  room.status === "open" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                }`}>
                  {room.status === "open" ? t("rooms.detail.status_open") : t("rooms.detail.status_closed")}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 whitespace-nowrap shadow-sm">
                  {room.mode === "exam" ? t("rooms.mode.exam") : t("rooms.mode.practice")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
               <div className="flex items-center gap-2 font-bold bg-muted/40 px-3 py-1 rounded-xl border border-border/40 text-[10px] truncate max-w-full">
                 <FileText className="w-3 h-3 text-primary shrink-0" /> 
                 <span className="uppercase tracking-widest opacity-60 shrink-0">{t("rooms.detail.exam")}:</span>
                 <span className="text-foreground truncate">{room.examTitle}</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={handleCopyCode}
                className="relative flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all active:scale-95 group/code text-left min-h-[90px] shadow-sm overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/code:bg-primary transition-colors" />
                <div className="flex items-center justify-between w-full mb-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.card.code")}</p>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-mono font-black text-primary tracking-tighter leading-none">{room.roomCode}</p>
                  {copied && <span className="text-[7px] font-black uppercase bg-primary text-white px-1.5 py-0.5 rounded-md animate-bounce">COPIED</span>}
                </div>
              </button>

              <div className="flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl transition-all hover:border-primary/20 min-h-[90px] shadow-sm relative group/card">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.detail.duration")}</p>
                <p className="text-xl font-black leading-none">{room.durationMinutes} <span className="text-[10px] text-muted-foreground font-bold uppercase opacity-40 ml-0.5">{t("rooms.detail.minutes")}</span></p>
              </div>

              <div className="flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl transition-all hover:border-primary/20 min-h-[90px] shadow-sm relative group/card">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.card.submissions")}</p>
                <p className="text-xl font-black leading-none">{room.submissionCount}</p>
              </div>

              <div className="flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl transition-all hover:border-primary/20 min-h-[90px] shadow-sm relative group/card">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.form.max_attempts")}</p>
                <p className="text-xl font-black leading-none">{room.maxAttempts > 0 ? room.maxAttempts : "∞"}</p>
              </div>

              <div className="flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl transition-all hover:border-primary/20 min-h-[90px] shadow-sm">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.form.show_score")}</p>
                <div className="flex">
                  <span className={cn(
                    "inline-flex items-center text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all shadow-sm",
                    room.showScoreAfterSubmission 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                      : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full mr-2 shadow-sm", room.showScoreAfterSubmission ? "bg-emerald-500" : "bg-rose-500")} />
                    {room.showScoreAfterSubmission ? t("common.on") : t("common.off")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl transition-all hover:border-primary/20 min-h-[90px] shadow-sm">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.form.show_answer")}</p>
                <div className="flex">
                  <span className={cn(
                    "inline-flex items-center text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all shadow-sm",
                    room.showAnswersAfterSubmission 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                      : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full mr-2 shadow-sm", room.showAnswersAfterSubmission ? "bg-emerald-500" : "bg-rose-500")} />
                    {room.showAnswersAfterSubmission ? t("common.on") : t("common.off")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between bg-card border border-border/60 p-4 rounded-2xl transition-all hover:border-primary/20 min-h-[90px] shadow-sm">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t("rooms.form.show_submission")}</p>
                <div className="flex">
                  <span className={cn(
                    "inline-flex items-center text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all shadow-sm",
                    room.showSubmissionAfterSubmission 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                      : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full mr-2 shadow-sm", room.showSubmissionAfterSubmission ? "bg-emerald-500" : "bg-rose-500")} />
                    {room.showSubmissionAfterSubmission ? t("common.on") : t("common.off")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-72 bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-4 space-y-3 flex flex-col justify-center shadow-inner">
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                   <Clock className="w-3 h-3 text-primary shrink-0" />
                   <span className="text-[10px] font-bold uppercase tracking-tight truncate">{t("rooms.detail.open_at")}:</span>
                </div>
                 <span className="font-bold text-[10px] bg-muted px-2 py-0.5 rounded-lg shrink-0 tabular-nums">{formatDateTime(room.openAt)}</span>
             </div>
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                   <Clock className="w-3 h-3 text-primary shrink-0" />
                   <span className="text-[10px] font-bold uppercase tracking-tight truncate">{t("rooms.detail.close_at")}:</span>
                </div>
                 <span className="font-bold text-[10px] bg-muted px-2 py-0.5 rounded-lg shrink-0 tabular-nums">{formatCloseTime(room.closeAt)}</span>
             </div>
             <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                   <Users className="w-3 h-3 text-primary shrink-0" />
                   <span className="text-[10px] font-bold uppercase tracking-tight truncate">{t("rooms.detail.require_list")}:</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shrink-0 ${room.requireStudentList ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"}`}>
                  {room.requireStudentList ? t("rooms.detail.yes") : t("rooms.detail.no")}
                </span>
             </div>
             <div className="pt-3 mt-1 border-t border-border/50">
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  {t("share.title") || "Share & QR Code"}
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 border-b border-border px-4">
        {[
          { id: "submissions", label: t("rooms.detail.tab_submissions"), icon: FileText, count: submissions.length },
          { id: "students", label: t("rooms.detail.tab_students"), icon: Users, count: students.length, hidden: !room.requireStudentList }
        ].filter(tab => !tab.hidden).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 font-bold text-sm uppercase tracking-tight transition-all relative flex items-center gap-2.5 ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-bounce" : ""}`} />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${activeTab === tab.id ? "bg-primary/10" : "bg-muted"}`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-lg shadow-primary/50" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        {activeTab === "submissions" ? (
          <div className="divide-y divide-border">
            <div className="p-5 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <input 
                   type="text"
                   placeholder={t("header.search")}
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                 />
               </div>
               
               <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl w-fit">
                  {[
                    { id: 'all', label: t('common.all') },
                    { id: 'pending', label: t('rooms.detail.grading.status_pending') },
                    { id: 'graded', label: t('common.graded') }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSubmissionFilter(f.id)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg font-bold text-xs transition-all",
                        submissionFilter === f.id
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/30 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-b border-border">
                  <tr>
                    <th className="px-8 py-5 text-center min-w-[200px]">{t("register.fullName")}</th>
                    <th className="px-8 py-5 text-center whitespace-nowrap">{t("common.attempts")}</th>
                    <th className="px-8 py-5 text-center min-w-[180px]">{t("dashboard.recentQuizzes.table.date")}</th>
                    <th className="px-8 py-5 text-center whitespace-nowrap">{t("dashboard.recentQuizzes.table.status")}</th>
                    <th className="px-8 py-5 text-center whitespace-nowrap">{t("dashboard.topStudents.avgScore")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                   {filteredSubmissions.length === 0 ? (
                     <tr>
                       <td colSpan="6" className="px-8 py-20 text-center text-muted-foreground italic font-medium opacity-50">
                          <div className="flex flex-col items-center gap-3">
                             <FileText className="w-12 h-12 opacity-10" />
                             {t("rooms.detail.no_submissions")}
                          </div>
                       </td>
                     </tr>
                   ) : (
                     filteredSubmissions.map((sub, idx) => (
                       <tr 
                         key={sub.submissionId} 
                         onClick={() => navigate(`/dashboard/teacher/rooms/${roomId}/submissions/${sub.submissionId}`)}
                         className="hover:bg-primary/[0.03] transition-all group cursor-pointer border-b border-border/50 last:border-0"
                       >
                          <td className="px-8 py-6 text-center">
                             <div className="flex flex-col items-center">
                                <p className="font-bold text-lg group-hover:text-primary transition-colors">{sub.studentName}</p>
                                <p className="text-xs text-muted-foreground font-mono font-bold opacity-60">ID: {sub.studentId}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black whitespace-nowrap">
                                {sub.attemptNumber} / {sub.maxAttempts > 0 ? sub.maxAttempts : "∞"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs text-muted-foreground font-bold whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Calendar className="w-3.5 h-3.5 opacity-40" />
                              {formatDateTime(sub.submittedAt)}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                sub.gradingStatus === "fully_graded"
                                ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              )}>
                                {sub.gradingStatus === "fully_graded" ? t('common.fully_graded') : t('common.pending_confirmation')}
                              </span>
                            </div>
                          </td>
                         <td className="px-8 py-6 text-center whitespace-nowrap">
                           <div className="flex flex-col items-center">
                            <p className={cn(
                              "text-2xl font-black tabular-nums",
                              sub.avgScore >= 5 ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {sub.avgScore?.toFixed(1)}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase">{t("common.avg")}</p>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full" ref={studentListRef}>
            <div className="p-6 border-b border-border bg-muted/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder={t("rooms.detail.search_placeholder")}
                      value={studentSearchTerm}
                      onChange={(e) => {
                        setStudentSearchTerm(e.target.value);
                        setStudentPage(1);
                      }}
                      className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium font-heading"
                    />
                  </div>
                  <button 
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-5 py-2.5 rounded-2xl transition-all font-bold text-sm font-heading group shadow-sm"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    {t("rooms.detail.add_student")}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                   {pendingFile ? (
                     <div className="flex items-center gap-3 bg-muted/50 border border-border p-1 pr-1.5 rounded-2xl animate-in fade-in slide-in-from-right-4">
                        <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5" />
                           {pendingFile.name}
                        </div>
                        <div className="flex gap-1.5">
                           <button 
                             onClick={handlePreviewFile}
                             disabled={uploading}
                             className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                           >
                              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                              {t("common.preview") || "Preview"}
                           </button>
                           <button 
                             onClick={() => setPendingFile(null)}
                             className="bg-card border border-border text-muted-foreground p-2 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95"
                           >
                              <X className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                   ) : (
                     <>
                        <p className="text-[11px] text-muted-foreground italic font-medium opacity-70 hidden md:flex items-center gap-1.5 tracking-tight">
                           <FileText className="w-4 h-4" /> {t("rooms.detail.import_hint")}
                        </p>
                        <label className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-2xl font-bold text-sm tracking-tight transition-all cursor-pointer border border-border/50 active:scale-95 group font-heading">
                          <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                          {t("rooms.detail.tab_students")}
                          <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleFileUpload} hidden />
                        </label>
                     </>
                   )}
                </div>
              </div>
            </div>

            <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedStudents.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center text-muted-foreground italic font-bold opacity-40"
                      >
                         <div className="space-y-4">
                            <Users className="w-16 h-16 mx-auto opacity-10" />
                            <p>{t("rooms.detail.empty_students") || "Chưa có học sinh nào trong danh sách."}</p>
                         </div>
                      </motion.div>
                    ) : (
                      paginatedStudents.map((s, index) => {
                        const globalIndex = (studentPage - 1) * studentsPerPage + index + 1;
                        return (
                          <motion.div
                            key={s.id || s.studentId}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => {
                              if (s.hasSubmitted) {
                                // Find latest submission for this student
                                const sub = [...submissions].reverse().find(sub => sub.studentId === s.studentId);
                                if (sub) navigate(`/dashboard/teacher/rooms/${roomId}/submissions/${sub.submissionId}`);
                              }
                            }}
                            className={cn(
                              "bg-background border border-border/50 rounded-2xl p-4 flex items-center justify-between group transition-all relative overflow-hidden",
                              s.hasSubmitted ? "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:bg-primary/[0.02]" : "cursor-default"
                            )}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                            <div className="flex items-center gap-4">
                              <div className="text-[11px] font-bold text-muted-foreground/40 w-6 text-center">
                                #{globalIndex}
                              </div>
                              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary text-lg border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                {s.studentName?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest min-w-[50px]">Họ tên:</span>
                                  <p className="font-bold text-sm text-foreground truncate">{s.studentName}</p>
                                  {s.hasSubmitted ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" title={t("rooms.detail.status_done")} />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" title={t("rooms.detail.status_pending")} />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest min-w-[50px]">Mã số:</span>
                                   <p className="text-xs font-bold text-primary/80">{s.studentId}</p>
                                   <span className={cn(
                                     "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ml-2 border",
                                     s.hasSubmitted 
                                     ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                     : "bg-muted text-muted-foreground/70 border-transparent"
                                   )}>
                                     {s.hasSubmitted ? t("rooms.detail.status_done") : t("rooms.detail.status_pending")}
                                   </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!s.hasSubmitted && (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleEditStudent(s); }}
                                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 rounded-xl transition-all"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteStudent(s.id, s.studentName); }}
                                    className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {s.hasSubmitted && <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
               </div>

               {totalPages > 1 && (
                 <div className="mt-8 flex items-center justify-center gap-2">
                    <button 
                      disabled={studentPage === 1}
                      onClick={() => handlePageChange(studentPage - 1)}
                      className="p-2.5 rounded-xl border border-border hover:bg-muted disabled:opacity-30 transition-all active:scale-90"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1.5 px-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                            studentPage === p 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                            : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button 
                      disabled={studentPage === totalPages}
                      onClick={() => handlePageChange(studentPage + 1)}
                      className="p-2.5 rounded-xl border border-border hover:bg-muted disabled:opacity-30 transition-all active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4 rotate-0" />
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={actionLoading}
        confirmText={t("common.ok")}
        cancelText={t("common.cancel")}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId}
        roomCode={room?.roomCode}
        roomName={room?.name}
      />

      <StudentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        students={previewStudents}
        onConfirm={handleConfirmUpload}
        loading={actionLoading}
      />

      {/* Manual Add Student Modal */}
      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStudentModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header match CreateRoomModal */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30 font-heading">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {editingStudent ? (t("rooms.detail.edit_student") || "Sửa thông tin học sinh") : t("rooms.detail.add_student")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {room.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddStudentModalOpen(false);
                    setEditingStudent(null);
                    setNewStudent({ studentId: "", studentName: "" });
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Form Content match CreateRoomModal */}
              <div className="p-6">
                <form onSubmit={handleAddStudentManual} className="space-y-5">
                   <div className="space-y-2">
                      <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80 font-heading">
                        <Users className="w-4 h-4 text-primary" /> {t("rooms.detail.student_id")} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={newStudent.studentId}
                        onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                        className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading text-sm"
                        placeholder="SV-001"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[13px] font-bold px-1 flex items-center gap-2 text-foreground/80 font-heading">
                        <FileText className="w-4 h-4 text-primary" /> {t("register.fullName")} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={newStudent.studentName}
                        onChange={(e) => setNewStudent({...newStudent, studentName: e.target.value})}
                        className="w-full bg-muted/50 border border-border rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading text-sm"
                        placeholder="Nguyễn Văn A"
                      />
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddStudentModalOpen(false);
                          setEditingStudent(null);
                          setNewStudent({ studentId: "", studentName: "" });
                        }}
                        className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-4 rounded-2xl transition-all font-heading"
                      >
                        {t("common.cancel")}
                      </button>
                      <button 
                        type="submit"
                        disabled={actionLoading}
                        className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] font-heading"
                      >
                        {actionLoading ? t("common.loading") : (
                          <>
                            <Plus className="w-4 h-4" />
                            {t("common.ok")}
                          </>
                        )}
                      </button>
                   </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
