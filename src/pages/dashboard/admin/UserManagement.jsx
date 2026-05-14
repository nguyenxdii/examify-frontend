import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Lock, Unlock, Mail, Loader2, Search, 
  ChevronRight, X, BookOpen, User as UserIcon, 
  Send, Activity, Calendar, MapPin, Briefcase,
  Database, Zap, Globe, ArrowUp, ChevronLeft, Layout
} from "lucide-react";
import { getUsers, toggleUserLock, getUserDetail } from "../../../api/adminApi";
import { toast } from "react-hot-toast";
import { cn } from "../../../lib/utils";
import ConfirmationModal from "../../../components/dashboard/ConfirmationModal";
import Pagination from "../../../components/dashboard/Pagination";
import { motion, AnimatePresence } from "framer-motion";

export default function UserManagement() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [timeRange, setTimeRange] = useState("30"); // "1", "7", "30"

  // Lock Reason Modal
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [userToLock, setUserToLock] = useState(null);

  // Status Filter & Pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    document.title = t("titles.admin_users");
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error(t("dashboard.admin.users.fetch_error") || "Không thể tải danh sách giáo viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    try {
      setUserDetail(null);
      setLoadingDetail(true);
      setShowDetailModal(true);
      const res = await getUserDetail(user.id);
      setUserDetail(res.data);
    } catch (err) {
      toast.error(t("dashboard.admin.users.detail_error") || "Không thể tải chi tiết người dùng");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleLockInModal = async (userId) => {
    setUserToLock(userId);
    setShowLockModal(true);
  };

  const performToggleLock = async (userId, reason = "") => {
    try {
      setActionLoading(userId);
      const res = await toggleUserLock(userId, reason);
      
      const newLockedStatus = res.data.locked !== undefined ? res.data.locked : res.data.isLocked;
      
      // Update local users list for the table
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, locked: newLockedStatus, isLocked: newLockedStatus } : u
      ));
      
      // Update modal state
      if (userDetail && userDetail.id === userId) {
        setUserDetail(prev => ({ ...prev, locked: newLockedStatus, isLocked: newLockedStatus }));
      }
      
      toast.success(newLockedStatus 
        ? (t("dashboard.admin.users.lock_success") || "Đã khóa tài khoản.") 
        : (t("dashboard.admin.users.unlock_success") || "Đã mở khóa tài khoản.")
      );
      setShowLockModal(false);
      setLockReason("");
    } catch (error) {
      toast.error(t("common.error") || "Thao tác thất bại.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatStorage = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMetricValue = (metric) => {
    if (!metric) return 0;
    if (timeRange === "1") return metric.day1;
    if (timeRange === "7") return metric.day7;
    return metric.day30;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                          (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()));
    const isLocked = (u.locked || u.isLocked);
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "locked" && isLocked) || 
                          (statusFilter === "active" && !isLocked);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, statusFilter]);

  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {t("dashboard.sidebar.users") || "Quản lý Giáo viên"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {t("dashboard.admin.users.subtitle") || "Xem hiệu suất và quản lý tài khoản của các giáo viên."}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder={t("dashboard.admin.users.search_placeholder") || "Tìm giáo viên theo tên, email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-5 font-black text-muted-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">
                  {t("dashboard.admin.users.table.teacher") || "Giáo viên"}
                </th>
                <th className="px-6 py-5 font-black text-muted-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">
                  {t("common.email") || "Email"}
                </th>
                <th className="px-6 py-5 font-black text-muted-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">
                  {t("dashboard.admin.users.table.join_date") || "Ngày gia nhập"}
                </th>
                <th className="px-6 py-5 font-black text-muted-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">
                  {t("dashboard.admin.users.table.status") || "Trạng thái"}
                </th>
                <th className="px-6 py-5 font-black text-muted-foreground uppercase tracking-widest text-[10px] whitespace-nowrap text-right">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-muted rounded-full w-full" /></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {paginatedUsers.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <UserIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold">
                          {t("dashboard.admin.users.no_users") || "Không tìm thấy giáo viên nào"}
                        </p>
                      </td>
                    </motion.tr>
                  ) : (
                    paginatedUsers.map((user, idx) => (
                      <motion.tr 
                        key={user.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={() => handleUserClick(user)}
                        className="hover:bg-muted/10 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                user.fullName?.charAt(0) || user.email.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{user.fullName || "N/A"}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                {user.role === 'admin' 
                                  ? t("dashboard.admin.users.role.admin") 
                                  : t("dashboard.admin.users.role.teacher")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-muted-foreground font-medium truncate max-w-[200px]" title={user.email}>{user.email}</p>
                        </td>
                        <td className="px-6 py-5 text-muted-foreground font-medium whitespace-nowrap">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : "N/A"}
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                            (user.locked || user.isLocked) 
                              ? "bg-rose-500/10 text-rose-500" 
                              : "bg-emerald-500/10 text-emerald-600"
                          )}>
                            {(user.locked || user.isLocked) 
                              ? t("dashboard.admin.users.status.locked") 
                               : t("dashboard.admin.users.status.active")}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          label={t("dashboard.admin.users.table.teacher") || "giáo viên"}
          showFirstLast={true}
        />
      </div>

      {/* User Detail Modal */}
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
              className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border bg-gradient-to-br from-muted/50 to-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="flex flex-col items-center text-center relative z-10 space-y-4">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-3xl font-black text-primary shadow-2xl border-4 border-card group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                        {userDetail?.avatar ? (
                          <img src={userDetail.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          userDetail?.fullName?.charAt(0).toUpperCase() || userDetail?.email?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl border-4 border-card flex items-center justify-center shadow-lg transition-colors",
                      (userDetail?.locked || userDetail?.isLocked) ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                      {(userDetail?.locked || userDetail?.isLocked) ? <Lock className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                      {userDetail?.fullName || t("common.not_updated")}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> {userDetail?.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                      userDetail?.role === 'admin' ? "bg-purple-500 text-purple-50" : "bg-primary text-primary-50"
                    )}>
                      {userDetail?.role === 'admin' ? t("dashboard.admin.users.role.admin") : t("dashboard.admin.users.role.teacher")}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                      (userDetail?.locked || userDetail?.isLocked) ? "bg-rose-500 text-rose-50" : "bg-emerald-500 text-emerald-50"
                    )}>
                      {(userDetail?.locked || userDetail?.isLocked) ? t("dashboard.admin.users.status.locked") : t("dashboard.admin.users.status.active")}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="absolute top-6 right-6 p-2 bg-card/50 hover:bg-muted rounded-2xl transition-all border border-border shadow-sm group z-20"
                >
                  <X className="w-5 h-5 text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {loadingDetail ? (
                   <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs font-bold text-muted-foreground">{t("common.loading")}</p>
                   </div>
                ) : userDetail && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center text-center space-y-1.5 group hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("nav.quizzes")}</p>
                            <h4 className="text-xl font-black text-foreground">{userDetail.totalExams}</h4>
                        </div>
                        <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center text-center space-y-1.5 group hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <Activity className="w-4 h-4" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("dashboard.sidebar.rooms")}</p>
                            <h4 className="text-xl font-black text-foreground">{userDetail.totalRooms}</h4>
                        </div>
                        <div className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center text-center space-y-1.5 group hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <Send className="w-4 h-4" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("rooms.card.submissions")}</p>
                            <h4 className="text-xl font-black text-foreground">{userDetail.totalSubmissions}</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">
                          {t("dashboard.admin.users.personal_info")}
                        </h5>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50"><MapPin className="w-4 h-4 opacity-60 text-primary" /></div>
                                <span className="truncate" title={userDetail.school}>{userDetail.school || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50"><Briefcase className="w-4 h-4 opacity-60 text-primary" /></div>
                                <span className="truncate" title={userDetail.field}>{userDetail.field || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50"><Calendar className="w-4 h-4 opacity-60 text-primary" /></div>
                                <span>{t("dashboard.admin.users.joined")}: {new Date(userDetail.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                            </div>
                        </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-border bg-muted/30 flex gap-3">
                {userDetail?.role !== 'admin' && (
                  <button 
                    onClick={() => handleToggleLockInModal(userDetail.id)}
                    disabled={actionLoading === userDetail?.id}
                    className={cn(
                      "flex-[2] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50",
                      (userDetail?.locked || userDetail?.isLocked) 
                          ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600" 
                          : "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600"
                    )}
                  >
                     {actionLoading === userDetail?.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (userDetail?.locked || userDetail?.isLocked) ? (
                          <><Unlock className="w-4 h-4" /> {t("dashboard.admin.users.unlock_btn")}</>
                      ) : (
                          <><Lock className="w-4 h-4" /> {t("dashboard.admin.users.lock_btn")}</>
                      )}
                  </button>
                )}
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-3.5 bg-card border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                >
                  {t("common.close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onConfirm={() => {
          const isCurrentlyLocked = (userDetail?.locked || userDetail?.isLocked);
          if (!isCurrentlyLocked && !lockReason.trim()) {
            toast.error(t("dashboard.admin.exams.delete_reason_required") || "Vui lòng nhập lý do");
            return;
          }
          performToggleLock(userToLock, lockReason);
        }}
        title={(userDetail?.locked || userDetail?.isLocked) ? t("dashboard.admin.users.unlock_btn") : t("dashboard.admin.users.lock_btn")}
        message={
          <div className="space-y-4 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {(userDetail?.locked || userDetail?.isLocked) 
                ? "Bạn có chắc chắn muốn mở khóa tài khoản này không? Người dùng sẽ có thể đăng nhập lại bình thường."
                : t("dashboard.admin.users.lock_confirm_msg") || "Bạn có chắc chắn muốn khóa tài khoản này không? Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa."}
            </p>
            {!(userDetail?.locked || userDetail?.isLocked) && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("dashboard.admin.exams.delete_modal.reason_label") || "Lý do khóa:"}</label>
                <textarea 
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                  placeholder={t("dashboard.admin.users.lock_reason_placeholder") || "VD: Vi phạm điều khoản, phát hiện gian lận..."}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
            )}
          </div>
        }
        confirmText={(userDetail?.locked || userDetail?.isLocked) ? t("dashboard.admin.users.unlock_btn") : t("dashboard.admin.users.lock_btn")}
        type={(userDetail?.locked || userDetail?.isLocked) ? "success" : "danger"}
        loading={actionLoading === userToLock}
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
    </div>
  );
}
