import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Users, Plus, Play, Square, Calendar, Clock, Copy, ArrowRight, Trash2, Search, MoreVertical } from "lucide-react";
import { getMyRooms, openRoom, closeRoom, deleteRoom } from "../../../api/roomApi";
import { useNavigate } from "react-router-dom";
import CreateRoomModal from "../../../components/dashboard/CreateRoomModal";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamRooms() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, open, closed
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const itemsPerPage = 10;
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {}
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getMyRooms();
      setRooms(response.data);
    } catch (error) {
      toast.error(t("rooms.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
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

  const filteredRooms = rooms.filter((room) => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'open' && room.status === 'open') || 
      (activeTab === 'closed' && room.status === 'closed');
    
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.examTitle && room.examTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleToggleStatusRequest = (room, e) => {
    e.stopPropagation();
    const isOpening = room.status !== "open";
    
    setConfirmModal({
      isOpen: true,
      title: isOpening ? t("rooms.toggle_open_title") : t("rooms.toggle_close_title"),
      message: isOpening 
        ? t("rooms.toggle_open_msg", { name: room.name }) 
        : t("rooms.toggle_close_msg", { name: room.name }),
      type: isOpening ? "success" : "warning",
      onConfirm: () => performToggleStatus(room)
    });
  };

  const performToggleStatus = async (room) => {
    try {
      setActionLoading(true);
      if (room.status === "open") {
        await closeRoom(room.id);
        toast.success(t("rooms.close_success"));
      } else {
        await openRoom(room.id);
        toast.success(t("rooms.open_success"));
      }
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.action_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = (room, e) => {
    e.stopPropagation();
    if (room.status === "open") {
      toast.error(t("rooms.delete_open_error"));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: t("rooms.delete_title"),
      message: t("rooms.delete_msg", { name: room.name }),
      type: "danger",
      onConfirm: () => performDelete(room.id)
    });
  };

  const performDelete = async (roomId) => {
    try {
      setActionLoading(true);
      await deleteRoom(roomId);
      toast.success(t("rooms.delete_success"));
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || t("rooms.delete_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const copyRoomCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(t("rooms.copy_success"));
  };

  const formatCardDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-600 border border-green-500/20">
            {t("rooms.status.open")}
          </span>
        );
      case "closed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/20">
            {t("rooms.status.closed")}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {t("rooms.status.pending")}
          </span>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("rooms.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("rooms.subtitle") || "Quản lý và theo dõi các phòng thi đang diễn ra"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] transition-all shadow-xl shadow-primary/20 active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t("rooms.create_btn")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-[2rem] animate-pulse" />
          ))}
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
                  { id: 'open', label: t("rooms.status.open") },
                  { id: 'closed', label: t("rooms.status.closed") }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
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
                    placeholder={t("dashboard.header.search") || "Tìm kiếm phòng thi..."}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedRooms.length > 0 ? (
                paginatedRooms.map((room, idx) => (
                  <motion.div
                    key={room.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => navigate(`/dashboard/teacher/rooms/${room.id}`)}
                    className="group bg-card border border-border rounded-[2rem] p-6 hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {room.name}
                          </h3>
                          {getStatusBadge(room.status)}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1 mb-4 flex items-center gap-2">
                          <ArrowRight className="w-3 h-3" /> {room.examTitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                          <div 
                            onClick={(e) => copyRoomCode(room.roomCode, e)}
                            className="flex items-center gap-2 bg-muted/50 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-xl transition-all cursor-pointer group/code border border-transparent hover:border-primary/20"
                            title="Click to copy code"
                          >
                            <span className="font-mono text-primary font-bold text-xs tracking-wider">{room.roomCode}</span>
                            <Copy className="w-3.5 h-3.5 opacity-40 group-hover/code:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span>{room.submissionCount} {t("rooms.detail.tab_submissions")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            <span>{formatCardDate(room.createdAt)}</span>
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
                          onClick={(e) => toggleMenu(e, room.id)}
                          className={`p-2.5 rounded-xl transition-all border border-transparent shadow-sm hover:shadow-md ${
                            activeMenuId === room.id 
                              ? 'bg-primary text-white shadow-primary/20' 
                              : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                          }`}
                          title={t("common.actions") || "Thao tác"}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === room.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                              <div className="p-1.5 flex flex-col">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleToggleStatusRequest(room, e); }}
                                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-bold group ${
                                    room.status === "open"
                                      ? "text-amber-500 hover:bg-amber-500/10"
                                      : "text-green-600 hover:bg-green-500/10"
                                  }`}
                                >
                                  {room.status === "open" ? (
                                    <>
                                      <Square className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                      {t("rooms.detail.close_btn") || "Đóng phòng thi"}
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                      {t("rooms.detail.open_btn") || "Mở phòng thi"}
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleDeleteRequest(room, e); }}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold text-red-500 group"
                                >
                                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  {t("common.delete") || "Xóa phòng thi"}
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
                  <p className="text-muted-foreground font-medium">Không tìm thấy phòng thi nào phù hợp.</p>
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-bold disabled:opacity-50 transition-all hover:bg-muted"
                >
                  {t("common.previous") || "Trước"}
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-primary text-white"
                          : "bg-card border border-border hover:bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-bold disabled:opacity-50 transition-all hover:bg-muted"
                >
                  {t("common.next") || "Sau"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <CreateRoomModal 
            isOpen={showCreateModal} 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchRooms();
            }}
          />
        )}
      </AnimatePresence>

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
    </div>
  );
}
