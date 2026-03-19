import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
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
  X
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
  deleteStudentManual
} from "../../../api/roomApi";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import SubmissionDetailModal from "../../../components/dashboard/SubmissionDetailModal";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

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
  const [newStudent, setNewStudent] = useState({ studentId: "", studentName: "" });
  const studentListRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {}
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, subRes] = await Promise.all([
        getRoomDetail(roomId),
        getRoomSubmissions(roomId)
      ]);
      setRoom(roomRes.data);
      setSubmissions(subRes.data);
      
      if (roomRes.data.requireStudentList) {
        const studentRes = await getStudentList(roomId);
        setStudents(studentRes.data);
      }
    } catch (error) {
      toast.error(t("rooms.fetch_error"));
      navigate("/dashboard/teacher/rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roomId]);

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
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      fetchData();
    } catch (error) {
      toast.error(t("rooms.action_error"));
    } finally {
      setActionLoading(false);
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
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      navigate("/dashboard/teacher/rooms");
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.delete_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await uploadStudentList(roomId, formData);
      toast.success(t("rooms.detail.upload_success") || "Đã tải danh sách học sinh");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.upload_error") || "Lỗi tải lên danh sách");
    } finally {
      setUploading(false);
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
      await addStudentManual(roomId, newStudent);
      toast.success(t("rooms.detail.add_success") || "Đã thêm học sinh");
      setIsAddStudentModalOpen(false);
      setNewStudent({ studentId: "", studentName: "" });
      fetchData();
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
          fetchData();
        } catch (error) {
          toast.error(t("rooms.action_error"));
        } finally {
          setActionLoading(false);
        }
      }
    });
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
      toast.error("Không thể sao chép");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/dashboard/teacher/rooms")}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground -ml-1.5"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              {t("rooms.detail.back")}
            </p>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {room.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
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
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-heading">{room.name}</h1>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                  room.status === "open" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}>
                  {room.status === "open" ? t("rooms.detail.status_open") : t("rooms.detail.status_closed")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                 <p className="flex items-center gap-2 font-bold bg-muted/50 px-3 py-1 rounded-xl border border-border/50 text-xs">
                   <FileText className="w-3.5 h-3.5 text-primary" /> 
                   <span className="uppercase tracking-tight opacity-60">{t("rooms.detail.exam")}:</span>
                   <span className="text-foreground">{room.examTitle}</span>
                 </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={handleCopyCode}
                className="relative space-y-1 bg-muted/30 p-3.5 rounded-2xl border border-border/50 hover:bg-muted/50 transition-all active:scale-95 group/code text-left overflow-hidden"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                  <span className="text-[8px] font-bold uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">
                    {copied ? "COPIED!" : "COPY"}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{t("rooms.card.code")}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-mono font-bold text-primary tracking-tighter">{room.roomCode}</p>
                </div>
              </button>
              <div className="space-y-1 bg-muted/30 p-3.5 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{t("rooms.detail.duration")}</p>
                <p className="text-lg font-bold">{room.durationMinutes} <span className="text-[11px] text-muted-foreground opacity-60 uppercase">{t("rooms.detail.minutes")}</span></p>
              </div>
              <div className="space-y-1 bg-muted/30 p-3.5 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{t("rooms.card.submissions")}</p>
                <p className="text-lg font-bold">{room.submissionCount}</p>
              </div>
              <div className="space-y-1 bg-muted/30 p-3.5 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{t("rooms.detail.mode")}</p>
                <p className="text-[11px] font-bold uppercase tracking-tight text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-lg text-center">{room.mode === "exam" ? t("rooms.mode.exam") : t("rooms.mode.practice")}</p>
              </div>
            </div>
          </div>

          <div className="lg:w-80 bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-5 space-y-3.5 flex flex-col justify-center shadow-inner">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Clock className="w-3.5 h-3.5 text-primary" />
                   <span className="text-[11px] font-bold uppercase tracking-tight">{t("rooms.detail.open_at")}:</span>
                </div>
                <span className="font-mono font-bold text-xs bg-muted px-2.5 py-1 rounded-lg">{formatDateTime(room.openAt)}</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Clock className="w-3.5 h-3.5 text-primary" />
                   <span className="text-[11px] font-bold uppercase tracking-tight">{t("rooms.detail.close_at")}:</span>
                </div>
                <span className="font-mono font-bold text-xs bg-muted px-2.5 py-1 rounded-lg">{formatDateTime(room.closeAt)}</span>
             </div>
             <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Layout className="w-3.5 h-3.5 text-primary" />
                   <span className="text-[11px] font-bold uppercase tracking-tight">{t("rooms.detail.require_list")}:</span>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-lg border ${room.requireStudentList ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"}`}>
                  {room.requireStudentList ? t("rooms.detail.yes") : t("rooms.detail.no")}
                </span>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] border-b border-border">
                  <tr>
                    <th className="px-8 py-5">{t("register.fullName")}</th>
                    <th className="px-8 py-5">{t("dashboard.recentQuizzes.table.date")}</th>
                    <th className="px-8 py-5 text-center">{t("dashboard.topStudents.avgScore")}</th>
                    <th className="px-8 py-5 text-right font-bold text-primary">{t("rooms.detail.preview")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-muted-foreground italic font-medium opacity-50">
                         <div className="flex flex-col items-center gap-3">
                            <FileText className="w-12 h-12 opacity-10" />
                            {t("rooms.detail.no_submissions") || "Chưa có bài nộp nào"}
                         </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.submissionId} className="hover:bg-muted/5 transition-all group cursor-default">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10">
                               {sub.studentName?.charAt(0)}
                             </div>
                             <div>
                               <p className="font-bold text-lg group-hover:text-primary transition-colors">{sub.studentName}</p>
                               <p className="text-xs text-muted-foreground font-mono font-bold opacity-60">ID: {sub.studentId}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-muted-foreground font-bold">
                           <div className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5 opacity-40" />
                             {formatDateTime(sub.submittedAt)}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                             <div className={`text-2xl font-bold ${sub.score >= (sub.totalQuestions / 2) ? "text-green-500" : "text-red-500"}`}>
                               {sub.score?.toFixed(1)}
                             </div>
                             <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-40 border-l border-border pl-3 text-left leading-none">
                               / {sub.totalQuestions}<br/>{t("wizard.steps.generation")}
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => setSelectedSubmissionId(sub.submissionId)}
                            className="bg-primary/5 hover:bg-primary text-primary hover:text-white px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 group/btn shadow-sm"
                          >
                            {t("list.details")} 
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
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
                   <p className="text-[11px] text-muted-foreground italic font-medium opacity-70 flex items-center gap-1.5 tracking-tight">
                      <FileText className="w-4 h-4" /> {t("rooms.detail.import_hint")}
                   </p>
                   <label className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-2xl font-bold text-sm tracking-tight transition-all cursor-pointer border border-border/50 active:scale-95 group font-heading">
                     {uploading ? <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />}
                     {uploading ? t("common.loading") : t("rooms.detail.tab_students")}
                     <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleFileUpload} hidden />
                   </label>
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
                            <p>{t("list.empty")}</p>
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
                            className="bg-background border border-border/50 rounded-2xl p-4 flex items-center justify-between group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                            <div className="flex items-center gap-4">
                              <div className="text-[11px] font-bold text-muted-foreground/40 w-6 text-center">
                                #{globalIndex}
                              </div>
                              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary text-lg border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                {s.studentName?.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-base transition-colors">{s.studentName}</p>
                                  {s.hasSubmitted ? (
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title={t("rooms.detail.status_done")} />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" title={t("rooms.detail.status_pending")} />
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                   <p className="text-xs font-mono font-bold text-primary/60">{s.studentId}</p>
                                   <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-md ${
                                     s.hasSubmitted 
                                     ? "bg-green-500/10 text-green-600" 
                                     : "bg-muted text-muted-foreground/70"
                                   }`}>
                                     {s.hasSubmitted ? t("rooms.detail.status_done") : t("rooms.detail.status_pending")}
                                   </span>
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleDeleteStudent(s.id, s.studentName)}
                              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {selectedSubmissionId && (
        <SubmissionDetailModal
           isOpen={!!selectedSubmissionId}
           onClose={() => setSelectedSubmissionId(null)}
           roomId={roomId}
           submissionId={selectedSubmissionId}
           onGraded={fetchData}
        />
      )}

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
                      {t("rooms.detail.add_student")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {room.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddStudentModalOpen(false)}
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
                        onClick={() => setIsAddStudentModalOpen(false)}
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
