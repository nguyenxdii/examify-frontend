import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle2, AlertCircle, Save, Loader2, Users, UserCheck, Search, ShieldCheck } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export default function StudentPreviewModal({ isOpen, onClose, students = [], onConfirm, loading = false, hasExistingStudents = false }) {
  const { t } = useTranslation();
  
  const uniqueStudents = useMemo(() => {
    const seen = new Set();
    return students.filter(student => {
      if (!student.studentId) return false;
      const isDuplicate = seen.has(student.studentId);
      seen.add(student.studentId);
      return !isDuplicate;
    });
  }, [students]);

  const duplicatesCount = students.length - uniqueStudents.length;
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredStudents = uniqueStudents.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-background/80 backdrop-blur-md" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-2xl bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-12 py-10 border-b border-border bg-muted/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-black font-heading text-foreground tracking-tight leading-tight mb-1">
                  {t("rooms.detail.ai_verify_title", "Danh sách học sinh")}
                </h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 flex items-center gap-2">
                  {uniqueStudents.length} {t("rooms.detail.tab_students", "Học sinh")}
                  {duplicatesCount > 0 && (
                    <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded ml-1">
                      {t("rooms.detail.duplicate_filtered", { count: duplicatesCount, defaultValue: `• ĐÃ LỌC ${duplicatesCount} TRÙNG LẶP` })}
                    </span>
                  )}
                </p>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border shrink-0 ml-2">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {hasExistingStudents && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 relative z-10"
              >
                <div className="p-1 bg-rose-500 rounded-lg shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                <p className="text-[10px] text-rose-700 font-bold leading-relaxed">
                  <Trans 
                    i18nKey="rooms.detail.replace_warning"
                    defaults="CẢNH BÁO: Phòng thi đã có danh sách học sinh. Việc lưu danh sách mới sẽ <1>THAY THẾ TOÀN BỘ</1> dữ liệu cũ và có thể làm mất kết quả các bài thi đã nộp."
                    components={{ 1: <span className="underline decoration-2" /> }}
                  />
                </p>
              </motion.div>
            )}
          </div>

          {/* Search & Stats */}
          <div className="px-5 py-4 bg-muted/10 border-b border-border">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder={t("rooms.detail.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
             {filteredStudents.length === 0 ? (
               <div className="py-12 text-center space-y-4">
                 <Users className="w-12 h-12 mx-auto opacity-10" />
                 <p className="text-muted-foreground font-bold italic text-sm">{t("rooms.detail.no_students_found")}</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-2">
                 {filteredStudents.map((s, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl border border-border bg-background hover:border-primary/30 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{s.studentName}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                            ID: {s.studentId}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                 ))}
               </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 bg-muted hover:bg-muted/80 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              {t("common.cancel")}
            </button>
            <button 
              onClick={() => onConfirm(uniqueStudents)}
              disabled={loading || uniqueStudents.length === 0}
              className={cn(
                "flex-[2] py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl",
                uniqueStudents.length === 0 
                  ? "bg-muted text-muted-foreground cursor-not-allowed border border-border" 
                  : "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("common.save")}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
