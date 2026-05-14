import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Save, Loader2, Users, UserCheck, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export default function StudentPreviewModal({ isOpen, onClose, students = [], onConfirm, loading = false }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicates, setDuplicates] = useState([]);
  
  useEffect(() => {
    // Check for duplicates
    const ids = students.map(s => s.studentId);
    const dups = ids.filter((id, index) => ids.indexOf(id) !== index);
    setDuplicates([...new Set(dups)]);
  }, [students]);

  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-4xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-border bg-muted/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-heading text-foreground uppercase tracking-tight">
                    {t("rooms.detail.ai_verify_title") || "AI KIỂM TRA DANH SÁCH"}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    {students.length} {t("rooms.detail.tab_students")} • {duplicates.length > 0 ? `${duplicates.length} lỗi trùng lặp` : "Danh sách hợp lệ"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Search & Stats */}
          <div className="p-6 bg-muted/10 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder={t("rooms.detail.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
              />
            </div>
            
            <div className="flex items-center gap-4">
               {duplicates.length > 0 && (
                 <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-black uppercase tracking-widest animate-pulse">
                   <AlertCircle className="w-4 h-4" />
                   {t("rooms.detail.duplicate_warning") || "PHÁT HIỆN TRÙNG LẶP"}
                 </div>
               )}
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
                 <UserCheck className="w-4 h-4" />
                 OK
               </div>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
             {filteredStudents.length === 0 ? (
               <div className="py-20 text-center space-y-4">
                 <Users className="w-16 h-16 mx-auto opacity-10" />
                 <p className="text-muted-foreground font-bold italic">{t("rooms.detail.no_students_found") || "Không tìm thấy học sinh nào khớp"}</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filteredStudents.map((s, idx) => {
                   const isDuplicate = duplicates.includes(s.studentId);
                   return (
                     <motion.div 
                       key={idx}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={cn(
                         "p-4 rounded-2xl border transition-all flex items-center justify-between",
                         isDuplicate 
                           ? "bg-rose-500/5 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                           : "bg-background border-border hover:border-primary/30"
                       )}
                     >
                       <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                           isDuplicate ? "bg-rose-500 text-white" : "bg-primary/5 text-primary"
                         )}>
                           {idx + 1}
                         </div>
                         <div>
                            <p className="font-black text-sm text-foreground">{s.studentName}</p>
                            <p className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              isDuplicate ? "text-rose-500" : "text-muted-foreground opacity-60"
                            )}>
                              ID: {s.studentId} {isDuplicate && "• TRÙNG LẶP"}
                            </p>
                         </div>
                       </div>
                       <div>
                          {isDuplicate ? (
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-40" />
                          )}
                       </div>
                     </motion.div>
                   );
                 })}
               </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-border bg-muted/20 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-muted hover:bg-muted/80 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              {t("common.cancel")}
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading || duplicates.length > 0}
              className={cn(
                "flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl",
                duplicates.length > 0 
                  ? "bg-muted text-muted-foreground cursor-not-allowed border border-border" 
                  : "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95"
              )}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {t("common.save")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
